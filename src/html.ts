import { isEvent, isProps } from "./attribute";

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
  if (obj && typeof obj === "object") {
    const hasProperty = Object.prototype.hasOwnProperty.bind(obj);
    return hasProperty("strings") && hasProperty("values");
  }
  return false;
};

// TODO: check draft
export const isCustomElement = (tagname: string): boolean => {
  return /\S-\S/.test(tagname);
};
