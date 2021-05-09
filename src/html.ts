import { isEvent, isProps } from "./attribute";
import { hasProperties } from "./utils";

export type TemplateResult = {
  strings: TemplateStringsArray;
  values: unknown[];
};

export const html = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult => {
  return { strings, values };
};

export const ATTRIBUTE_NAME = "wc-ssr";
export const ATTRIBUTE_EVENT_NAME = `${ATTRIBUTE_NAME}-event`;
export const ATTRIBUTE_PROPS_NAME = `${ATTRIBUTE_NAME}-props`;

export const htmlToString = (result: TemplateResult): string => {
  return result.strings.reduce((res, str, i) => {
    let val = result.values[i];
    if (isTemplateResult(val)) {
      val = htmlToString(val);
    }
    if (isEvent(val)) {
      val = `data-${ATTRIBUTE_EVENT_NAME}="true"`;
    }
    if (isProps(val)) {
      val = `data-${ATTRIBUTE_PROPS_NAME}="true"`;
    }
    if (!val) {
      return res + str;
    }
    return res + str + val;
  }, "");
};

export const isTemplateResult = (obj: unknown): obj is TemplateResult => {
  return hasProperties<TemplateResult>(obj, ["strings", "values"]);
};

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export const isCustomElement = (tagname: string): boolean => {
  const validCustomElementName =
    "[-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]";
  const regexp = new RegExp(
    `[a-z]${validCustomElementName}*-${validCustomElementName}*`,
    "u"
  );
  return regexp.test(tagname);
};
