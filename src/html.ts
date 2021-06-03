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

export const ATTRIBUTE_NAME = "private-wc-ssr";
export const ATTRIBUTE_EVENT_NAME = `${ATTRIBUTE_NAME}-event`;
export const ATTRIBUTE_PROPS_NAME = `${ATTRIBUTE_NAME}-props`;
export const ATTRIBUTE_IS_PARENT = `${ATTRIBUTE_NAME}-is-parent`;

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
      val = `${ATTRIBUTE_EVENT_NAME}="true"`;
    }
    if (isProps(val)) {
      if (options?.isPage) {
        windowProps = val.props;
        val = `${ATTRIBUTE_IS_PARENT}="true"` + ' ' + `${ATTRIBUTE_PROPS_NAME}="true"`;
      } else {
        val = `${ATTRIBUTE_PROPS_NAME}="true"`;
      }
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
