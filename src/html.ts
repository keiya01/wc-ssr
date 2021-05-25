import { BaseProps, isEvent, isProps } from "./attribute";
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

// TODO: escape user data
export const htmlToString = (
  result: TemplateResult,
  options?: { isPage?: boolean }
): string => {
  let windowProps: BaseProps | null = null;
  const htmlString = result.strings.reduce((res, str, i) => {
    let val = result.values[i];
    if (isTemplateResult(val)) {
      val = htmlToString(val);
    }
    if (isEvent(val)) {
      val = `data-${ATTRIBUTE_EVENT_NAME}="true"`;
    }
    if (isProps(val)) {
      if (options?.isPage) {
        windowProps = val.props;
      }
      val = `data-${ATTRIBUTE_PROPS_NAME}="true"`;
    }
    if (Array.isArray(val)) {
      val = val.reduce((res, item) => {
        if (!item) {
          return res;
        }
        if (isTemplateResult(item)) {
          res += htmlToString(item);
          return res;
        }
        return res + item;
      }, "");
    }
    if (!val) {
      return res + str;
    }
    return res + str + val;
  }, "");
  if (options?.isPage && windowProps) {
    return [
      `<script type="text/javascript">window.__PAGE_ELEMENT_PROPS__=${JSON.stringify(
        windowProps
      )}</script>`,
      htmlString,
    ].join("");
  }
  return htmlString;
};

export const isTemplateResult = (obj: unknown): obj is TemplateResult => {
  return hasProperties<TemplateResult>(obj, ["strings", "values"]);
};

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export const isCustomElement = (tagname: string): boolean => {
  if (!tagname) {
    return false;
  }
  const validCustomElementName =
    "[-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]";
  const regexp = new RegExp(
    `[a-z]${validCustomElementName}*-${validCustomElementName}*`,
    "u"
  );
  return regexp.test(tagname.toLowerCase());
};
