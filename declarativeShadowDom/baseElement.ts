import morphdom from 'morphdom';
import { getInternalShadowRoot } from "../client/utils/getInternalShadowRoot";
import { ComplexAttributeConverter, Properties, PropertyDeclaration, PropertyKey, HasChanged } from "./properties";
import { html, htmlToString, isCustomElement } from "./html";

type PropertyDeclarationMap = Map<PropertyKey, PropertyDeclaration>;
type AttributeMap = Map<string, PropertyKey>;

export const defaultConverter: ComplexAttributeConverter = {
  toAttribute(value: unknown, type?: unknown): unknown {
    switch (type) {
      case Boolean:
        value = value ? '' : null;
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
        // Do *not* generate exception when invalid JSON is set as elements
        // don't normally complain on being mis-configured.
        // TODO(sorvell): Do generate exception in *dev mode*.
        try {
          // Assert to adhere to Bazel's "must type assert JSON parse" rule.
          fromValue = JSON.parse(value!) as unknown;
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

export class BaseElement extends HTMLElement {
  constructor() {
    super();

    const shadow = getInternalShadowRoot(this);
    if(!shadow) {
      throw new Error('Declarative Shadow DOM is not supported in your browser.');
    }
  }

  private static __attributeToPropertyMap: AttributeMap;
  static elementProperties?: PropertyDeclarationMap;

  static properties: Properties;

  static createProperty(
    name: PropertyKey,
    options: PropertyDeclaration = defaultPropertyDeclaration
  ) {
    this.elementProperties!.set(name, options);
    // Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it
    if (!this.prototype.hasOwnProperty(name)) {
      const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
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
  ) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(): any {
        return (this as {[key: string]: unknown})[key as string];
      },
      set(this: BaseElement, value: unknown) {
        const oldValue = ((this as {}) as {[key: string]: unknown})[
          name as string
        ];
        ((this as {}) as {[key: string]: unknown})[key as string] = value;
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

  protected static getPropertyOptions(name: PropertyKey) {
    return this.elementProperties!.get(name) || defaultPropertyDeclaration;
  }

  static finalize() {
    this.elementProperties = new Map();
    // initialize Map populated in observedAttributes
    this.__attributeToPropertyMap = new Map();
    // make any properties
    // Note, only process "own" properties since this element will inherit
    // any properties defined on the superClass, and finalization ensures
    // the entire prototype chain is finalized.
    if (this.hasOwnProperty('properties')) {
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
      : typeof attribute === 'string'
      ? attribute
      : typeof name === 'string'
      ? name.toLowerCase()
      : undefined;
  }

  static get observedAttributes() {
    this.finalize();
    const attributes: string[] = [];
    this.elementProperties!.forEach((v, p) => {
      const attr = this.__attributeNameForProperty(p, v);
      if (attr !== undefined) {
        this.__attributeToPropertyMap.set(attr, p);
        attributes.push(attr);
      }
    });
    return attributes;
  }

  requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration) {
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

  _$attributeToProperty(name: string, value: string | null) {
    const ctor = this.constructor as typeof BaseElement;
    // Note, hint this as an `AttributeMap` so closure clearly understands
    // the type; it has issues with tracking types through statics
    const propName = (ctor.__attributeToPropertyMap as AttributeMap).get(name);
    // Use tracking info to avoid reflecting a property value to an attribute
    // if it was just set because the attribute changed.
    if (propName !== undefined) {
      const options = ctor.getPropertyOptions(propName);
      const fromAttribute = defaultConverter.fromAttribute;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this[propName as keyof this] = fromAttribute!(value, options.type) as any;
    }
  }

  update() {
    // @ts-ignore
    const fragment = new DOMParser().parseFromString(htmlToString(this.render()), 'text/html', {
      includeShadowRoots: true
    });
    const tagnames = fragment.body.getElementsByTagName(this.tagName);
    if(!tagnames.length) {
      throw new Error('Could not find updated tagname.');
    }

    const elm = tagnames[0];
    if(!elm || !this.shadowRoot) {
      throw new Error('Could not update custom element');
    }

    const updateElement = this.updateElement.bind(this);
    morphdom(this.shadowRoot, elm.shadowRoot!.innerHTML, {
      onBeforeElUpdated: (_, to) => {
        updateElement(this.shadowRoot!.children[0], to);
        return false;
      }
    });
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ) {
    this._$attributeToProperty(name, value);
  }

  // simple hydration
  updateElement(from: ChildNode, to: ChildNode) {
    let i = -1;
    // NOTE: fromElement should be same structure with toElement.
    while(true) {
      i++;
      const fromChild = from.childNodes[i];
      if(!fromChild) {
        return;
      }
      if(fromChild.nodeType === document.ELEMENT_NODE && isCustomElement((fromChild as Element).tagName)) {
        continue;
      }
      const toChild = to.childNodes[i];
      if(!toChild) {
        return;
      }

      // for textNode
      if(toChild.nodeType === document.TEXT_NODE) {
        fromChild.textContent = toChild.textContent;
      } else {
        this.updateElement(fromChild, toChild);
      }
    }
  }

  // TODO: DOMParser使うと良さそう: https://web.dev/declarative-shadow-dom/#parser-only
  render() {
    return html``;
  }
}
