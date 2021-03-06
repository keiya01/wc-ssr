import shallowequal from "shallowequal";
import morphdom from "morphdom";
import {
  ComplexAttributeConverter,
  Properties,
  PropertyDeclaration,
  PropertyKey,
  HasChanged,
} from "./properties";
import {
  ATTRIBUTE_EVENT_NAME,
  ATTRIBUTE_IS_PARENT,
  ATTRIBUTE_PROPS_NAME,
  html,
  htmlToString,
  isTemplateResult,
  TemplateResult,
} from "./html";
import {
  BaseProps,
  EventObject,
  hasShadowRoot,
  isEvent,
  isProps,
  PropsObject,
} from "./attribute";
import { attachTemplate, supportsDeclarativeShadowDOM } from "./polyfill";
import { isCustomElement } from "./customElementUtils";

type PropertyDeclarationMap = Map<PropertyKey, PropertyDeclaration>;
type AttributeMap = Map<string, PropertyKey>;

export const defaultConverter: ComplexAttributeConverter = {
  toAttribute(value: unknown, type?: unknown): unknown {
    switch (type) {
      case Boolean:
        value = value ? "" : null;
        break;
      case Object:
      case Array:
        // if the value is `null` or `undefined` pass this through
        // to allow removing/no change behavior.
        value = value == null ? value : JSON.stringify(value);
        break;
    }
    return value;
  },

  fromAttribute(value: string | null, type?: unknown) {
    let fromValue: unknown = value;
    switch (type) {
      case Boolean:
        fromValue = value !== null;
        break;
      case Number:
        fromValue = value === null ? null : Number(value);
        break;
      case Object:
      case Array:
        if (!value) {
          break;
        }
        try {
          fromValue = JSON.parse(value) as unknown;
        } catch (e) {
          fromValue = null;
        }
        break;
    }
    return fromValue;
  },
};

export const notEqual: HasChanged = (value: unknown, old: unknown): boolean => {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value);
};

const defaultPropertyDeclaration: PropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  hasChanged: notEqual,
};

const parseShadowDOM = (html: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new DOMParser().parseFromString(html, "text/html", {
    includeShadowRoots: true,
  });
};

export type BaseState = Record<PropertyKey, unknown>;

// TODO: support computed state that is invoked when this.state is updated.
export class BaseElement<
  Props extends BaseProps = BaseProps,
  State extends BaseState = BaseState
> extends HTMLElement {
  private events: EventObject<Event>[] = [];
  private __props: Props = {} as Props;
  private initialized = false;
  public state: State = {} as State;
  public props: Props = {} as Props;

  constructor() {
    super();

    // polyfill
    if (!this.shadowRoot) {
      // TODO: should tree shaking
      attachTemplate(this);
    }
  }

  private static __attributeToPropertyMap: AttributeMap;
  static elementProperties?: PropertyDeclarationMap;

  static properties: Properties;

  static createProperty(
    name: PropertyKey,
    options: PropertyDeclaration = defaultPropertyDeclaration
  ): void {
    if (this.elementProperties) {
      this.elementProperties.set(name, options);
    }
    if (!Object.prototype.hasOwnProperty.call(this.prototype, name)) {
      const key = typeof name === "symbol" ? Symbol() : `__${name}`;
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        Object.defineProperty(this.prototype, name, descriptor);
      }
    }
  }

  protected static getPropertyDescriptor(
    name: PropertyKey,
    key: string | symbol,
    options: PropertyDeclaration
  ): PropertyDescriptor {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(): any {
        return (this as { [key: string]: unknown })[key as string];
      },
      set(this: BaseElement, value: unknown) {
        const oldValue = ((this as unknown) as { [key: string]: unknown })[
          name as string
        ];
        ((this as unknown) as { [key: string]: unknown })[
          key as string
        ] = value;
        ((this as unknown) as BaseElement).requestUpdate(
          name,
          oldValue,
          options
        );
      },
      configurable: true,
      enumerable: true,
    };
  }

  protected static getPropertyOptions(name: PropertyKey): PropertyDeclaration {
    return (
      (this.elementProperties && this.elementProperties.get(name)) ||
      defaultPropertyDeclaration
    );
  }

  static finalize(): void {
    this.elementProperties = new Map();
    // initialize Map populated in observedAttributes
    this.__attributeToPropertyMap = new Map();
    // make any properties
    // Note, only process "own" properties since this element will inherit
    // any properties defined on the superClass, and finalization ensures
    // the entire prototype chain is finalized.
    if (Object.prototype.hasOwnProperty.call(this, "properties")) {
      const props = this.properties;
      // support symbols in properties (IE11 does not support this)
      const propKeys = [
        ...Object.getOwnPropertyNames(props),
        ...Object.getOwnPropertySymbols(props),
      ];
      // This for/of is ok because propKeys is an array
      for (const p of propKeys) {
        // note, use of `any` is due to TypeScript lack of support for symbol in
        // index types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.createProperty(p, (props as any)[p]);
      }
    }
  }

  private static __attributeNameForProperty(
    name: PropertyKey,
    options: PropertyDeclaration
  ) {
    const attribute = options.attribute;
    return attribute === false
      ? undefined
      : typeof attribute === "string"
      ? attribute
      : typeof name === "string"
      ? name.toLowerCase()
      : undefined;
  }

  static get observedAttributes(): string[] {
    this.finalize();
    const attributes: string[] = [ATTRIBUTE_PROPS_NAME];
    if (!this.elementProperties) {
      return [];
    }
    this.elementProperties.forEach((v, p) => {
      const attr = this.__attributeNameForProperty(p, v);
      if (attr !== undefined) {
        this.__attributeToPropertyMap.set(attr, p);
        attributes.push(attr);
      }
    });
    return attributes;
  }

  _render(): TemplateResult | null {
    return this.render();
  }

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration
  ): void {
    let shouldRequestUpdate = false;
    // If we have a property key, perform property update steps.
    if (name !== undefined) {
      options =
        options ||
        (this.constructor as typeof BaseElement).getPropertyOptions(name);
      const hasChanged = options.hasChanged || notEqual;
      if (hasChanged(this[name as keyof this], oldValue)) {
        shouldRequestUpdate = true;
      }
    }
    // TODO: support async update
    if (shouldRequestUpdate) {
      this.update();
    }
  }

  getTargetElement(elm: Element): Element[] {
    if (supportsDeclarativeShadowDOM()) {
      return Array.from(elm.shadowRoot?.children || []);
    }
    // TODO: should tree shaking
    attachTemplate(elm, { shouldSetShadow: false });
    return Array.from(elm.children);
  }

  _$attributeToProperty(name: string, value: string | null): void {
    const ctor = this.constructor as typeof BaseElement;
    // Note, hint this as an `AttributeMap` so closure clearly understands
    // the type; it has issues with tracking types through statics
    const propName = (ctor.__attributeToPropertyMap as AttributeMap).get(name);
    // Use tracking info to avoid reflecting a property value to an attribute
    // if it was just set because the attribute changed.
    if (propName !== undefined) {
      const options = ctor.getPropertyOptions(propName);
      const fromAttribute = defaultConverter.fromAttribute;
      if (!fromAttribute) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this[propName as keyof this] = fromAttribute(value, options.type) as any;
    }
  }

  updateProps(
    html: TemplateResult,
    { shouldSetProps = true }: { shouldSetProps?: boolean } = {}
  ): void {
    const fragment = parseShadowDOM(htmlToString(html));
    const elm = fragment.body.getElementsByTagName(this.tagName)[0];
    const isSupportedDeclarativeShadowDOM = supportsDeclarativeShadowDOM();
    const target = isSupportedDeclarativeShadowDOM
      ? elm.shadowRoot
      : this.getTargetElement(elm).slice(-1)[0];
    if (!target) {
      return;
    }

    const eventElementList = Array.from(
      target.querySelectorAll(`[${ATTRIBUTE_EVENT_NAME}]`)
    );
    const propsElementList = Array.from(
      target.querySelectorAll(`[${ATTRIBUTE_PROPS_NAME}]`)
    );

    // for polyfill
    if (!isSupportedDeclarativeShadowDOM && !(target instanceof ShadowRoot)) {
      if (target.hasAttribute(ATTRIBUTE_EVENT_NAME)) {
        eventElementList.push(target);
      }
      if (target.hasAttribute(ATTRIBUTE_PROPS_NAME)) {
        propsElementList.push(target);
      }
    }

    const propsList = [] as PropsObject[];

    const processTemplateResult = (val: TemplateResult) => {
      /**
       * <custom-elm1>
       *  <custom-elm2></custom-elm2> <- find this props. This element is included in html.values.
       * </custom-elm1>
       */
      val.values.some((innerVal) => {
        // If props is set, this element is custom element.
        if (propsElementList.length !== 0 && isProps(innerVal)) {
          propsList.push(innerVal);
          return true;
        }
        return false;
      });

      if (!hasShadowRoot(val)) {
        setHTMLValues(val);
        return;
      }
    };

    const setHTMLValues = (_html: TemplateResult) =>
      _html.values.map((val) => {
        if (eventElementList.length !== 0 && isEvent(val) && val.handler) {
          this.events.push(val);
          return;
        }
        if (isTemplateResult(val)) {
          processTemplateResult(val);
        }
        if (Array.isArray(val)) {
          val.map((item) => {
            if (isTemplateResult(item)) {
              processTemplateResult(item);
            }
          });
          return;
        }
      });
    setHTMLValues(html);

    this.setEvent();

    if (shouldSetProps) {
      this.setProps(propsList);
    }
  }

  setEvent(): void {
    if (!this.shadowRoot) {
      return;
    }
    const eventElementList = this.shadowRoot.querySelectorAll(
      `[${ATTRIBUTE_EVENT_NAME}]`
    );
    eventElementList.forEach((elm, i) => {
      const event = this.events[i];
      if (event && event.handler) {
        elm.addEventListener(event.eventName, event.handler);
      }
    });
  }

  setProps(propsList: PropsObject[]): void {
    if (!this.shadowRoot) {
      return;
    }
    const propsElementList = this.shadowRoot.querySelectorAll(
      `[${ATTRIBUTE_PROPS_NAME}]`
    );
    propsElementList.forEach((elm, i) => {
      if (!isCustomElement(elm.tagName)) {
        throw new Error("You can not set props to normal element.");
      }
      const propsObj = propsList[i];
      if (propsObj && propsObj.props && Object.keys(propsObj.props).length) {
        if (!shallowequal((elm as BaseElement).__props, propsObj.props)) {
          (elm as BaseElement).__props = propsObj.props;
          elm.setAttribute(ATTRIBUTE_PROPS_NAME, "true");
        }
      }
    });
  }

  /**
   * TODO
   * - Improve performance
   */
  update(): void {
    const html = this._render();
    if (!html) {
      return;
    }

    const fragment = parseShadowDOM(htmlToString(html));
    const elm = fragment.body.getElementsByTagName(this.tagName)[0];

    const fromElementChildren = this.shadowRoot?.children || [];
    const toElementChildren = this.getTargetElement(elm);

    if (fromElementChildren.length === 0 || toElementChildren.length === 0) {
      throw new Error("ShadowRoot could not found.");
    }

    /**
     * Other element should be style element or link element.
     * example:
     *  <custom-elm>
     *    <template ${$shadowroot()}>
     *      <link rel="XXX" href="XXX">
     *      <style>XXX</style>
     *      <div>Main contents is here.</div> <-- We want to get this element as fromElement or toElement.
     *    </template>
     *  </custom-elm>
     */
    const fromElement = fromElementChildren[fromElementChildren.length - 1];
    const toElement = toElementChildren[toElementChildren.length - 1];

    // Reset event before DOM is updated.
    this.resetEvents();

    morphdom(fromElement, toElement, {
      onBeforeElUpdated: (from, to) => {
        if (from.isEqualNode(to) || isCustomElement(from.tagName)) {
          return false;
        }
        return true;
      },
      childrenOnly: true,
    });

    // After state is updated, update event.
    // Because event is not registered correct even if update event before DOM is updated.
    this.updateProps(html);
  }

  init(): void {
    if (this.initialized) {
      return;
    }
    this.componentDidMount();
    this.initialized = true;
  }

  connectedCallback(): void {
    const isParent = this.hasAttribute(ATTRIBUTE_IS_PARENT);
    if (isParent) {
      const pageProps = ((window as unknown) as Record<string, unknown>)
        .__PAGE_ELEMENT_PROPS__ as Props;
      this.__props = pageProps;
      this.props = this.__props;
    }

    const hasProps = this.hasAttribute(ATTRIBUTE_PROPS_NAME);

    if (isParent || !hasProps) {
      const html = this._render();
      if (!html) {
        return;
      }
      this.updateProps(html, { shouldSetProps: !isParent });
    }

    // for server render
    if (Object.keys(this.props).length) {
      this.init();
    }
  }

  disconnectedCallback(): void {
    this.resetEvents();
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ): void {
    if (
      name === ATTRIBUTE_PROPS_NAME &&
      Object.keys(this.__props).length !== 0
    ) {
      this.props = this.__props;
      this.update();
      // for client render
      setTimeout(() => this.init(), 0);
      return;
    }
    this._$attributeToProperty(name, value);
  }

  resetEvents(): void {
    if (!this.shadowRoot) {
      return;
    }
    const eventElementList = this.shadowRoot.querySelectorAll(
      `[${ATTRIBUTE_EVENT_NAME}]`
    );
    eventElementList.forEach((elm, i) => {
      const event = this.events[i];
      if (event && event.handler) {
        elm.removeEventListener(event.eventName, event.handler);
      }
    });
    this.events = [];
  }

  setState(obj: Partial<State>): void {
    this.state = {
      ...this.state,
      ...obj,
    };
    this.update();
  }

  componentDidMount(): void {
    // Call this method when props has been prepared.
  }

  render(): TemplateResult {
    return html``;
  }
}
