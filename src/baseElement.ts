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
  ATTRIBUTE_PROPS_NAME,
  html,
  htmlToString,
  isCustomElement,
  isTemplateResult,
  TemplateResult,
} from "./html";
import {
  BaseProps,
  EventObject,
  isEvent,
  isProps,
  PropsObject,
} from "./attribute";

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

export class BaseElement<
  Props extends BaseProps = BaseProps,
  State extends BaseState = BaseState
> extends HTMLElement {
  private events: EventObject[] = [];
  private __props: Props = {} as Props;
  public state: State = {} as State;
  public props: Props = {} as Props;

  constructor() {
    super();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const internals = this.attachInternals();
    const shadow = internals.shadowRoot as ShadowRoot;
    if (!shadow) {
      throw new Error(
        "Declarative Shadow DOM is not supported in your browser."
      );
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
    const attributes: string[] = [`${ATTRIBUTE_PROPS_NAME}-changed`];
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

  updateProps(): void {
    const html = this.render();
    const fragment = parseShadowDOM(htmlToString(html));
    const elm = fragment.body.getElementsByTagName(this.tagName)[0];

    if (!elm.shadowRoot) {
      return;
    }
    const eventElementList = elm.shadowRoot.querySelectorAll(
      `[data-${ATTRIBUTE_EVENT_NAME}]`
    );
    const propsElementList = elm.shadowRoot.querySelectorAll(
      `[data-${ATTRIBUTE_PROPS_NAME}]`
    );

    const propsList = [] as PropsObject[];
    html.values.map((val) => {
      if (eventElementList.length !== 0 && isEvent(val) && val.handler) {
        this.events.push(val);
      }
      if (isTemplateResult(val)) {
        /**
         * <custom-elm1>
         *  <custom-elm2></custom-elm2> <- find this props. This element is included in html.values.
         * </custom-elm1>
         */
        val.values.find((innerVal) => {
          if (propsElementList.length !== 0 && isProps(innerVal)) {
            propsList.push(innerVal);
            return true;
          }
          return false;
        });
      }
    });
    this.setEvent();
    this.setProps(propsList);
  }

  setEvent(): void {
    if (!this.shadowRoot) {
      return;
    }
    const eventElementList = this.shadowRoot.querySelectorAll(
      `[data-${ATTRIBUTE_EVENT_NAME}]`
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
      `[data-${ATTRIBUTE_PROPS_NAME}]`
    );
    propsElementList.forEach((elm, i) => {
      const propsObj = propsList[i];
      if (propsObj && propsObj.props && Object.keys(propsObj.props).length) {
        if (!shallowequal((elm as BaseElement).__props, propsObj.props)) {
          (elm as BaseElement).__props = propsObj.props;
          elm.setAttribute(`${ATTRIBUTE_PROPS_NAME}-changed`, "true");
        }
      }
    });
  }

  update(): void {
    const fragment = parseShadowDOM(htmlToString(this.render()));
    const elm = fragment.body.getElementsByTagName(this.tagName)[0];

    const fromElement = this.shadowRoot;
    const toElement = elm.shadowRoot;

    if (!fromElement || !toElement) {
      return;
    }

    this.resetEvents();
    this.updateProps();

    /**
     * TODO
     *  - The case where element is added
     *  - The case where element is removed
     */
    morphdom(fromElement, toElement.innerHTML, {
      onBeforeElUpdated: (_, to) => {
        this.updateElement(fromElement.children[0], to);
        return false;
      },
    });
  }

  connectedCallback(): void {
    setTimeout(() => {
      this.props = (this as Record<string, unknown>).__props as Props;
      this.updateProps();
    }, 0);
    this.updateProps();
  }

  disconnectedCallback(): void {
    this.resetEvents();
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ): void {
    if (name === `${ATTRIBUTE_PROPS_NAME}-changed`) {
      this.props = this.__props;
      this.update();
      return;
    }
    this._$attributeToProperty(name, value);
  }

  resetEvents(): void {
    if (!this.shadowRoot) {
      return;
    }
    const eventElementList = this.shadowRoot.querySelectorAll(
      `[data-${ATTRIBUTE_EVENT_NAME}]`
    );
    eventElementList.forEach((elm, i) => {
      const event = this.events[i];
      if (event && event.handler) {
        elm.removeEventListener(event.eventName, event.handler);
      }
    });
    this.events = [];
  }

  setState(obj: State): void {
    this.state = {
      ...this.state,
      ...obj,
    };
    this.update();
  }

  // simple hydration
  updateElement(from: ChildNode, to: ChildNode): void {
    let i = -1;
    // NOTE: fromElement should be same structure with toElement.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      i++;
      const fromChild = from.childNodes[i];
      if (!fromChild) {
        return;
      }
      if (
        fromChild.nodeType === document.ELEMENT_NODE &&
        isCustomElement((fromChild as Element).tagName)
      ) {
        continue;
      }
      const toChild = to.childNodes[i];
      if (!toChild) {
        return;
      }

      // for textNode
      if (toChild.nodeType === document.TEXT_NODE) {
        fromChild.textContent = toChild.textContent;
      } else {
        this.updateElement(fromChild, toChild);
      }
    }
  }

  // TODO: DOMParser使うと良さそう: https://web.dev/declarative-shadow-dom/#parser-only
  render(): TemplateResult {
    return html``;
  }
}
