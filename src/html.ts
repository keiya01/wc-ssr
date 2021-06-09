import { BaseProps, isEvent, isProps, isShadowRoot } from "./attribute";
import { escapeHTML } from "./escapeHTML";
import { TEMPLATE_RESULT_TYPE } from "./symbols";
import { hasProperties } from "./utils";

export type TemplateResult = {
  $$typeof: symbol;
  strings: TemplateStringsArray;
  values: unknown[];
};

export const html = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult => {
  return { $$typeof: TEMPLATE_RESULT_TYPE, strings, values };
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
    res += str;

    const val = result.values[i];
    if (isTemplateResult(val)) {
      return res + htmlToString(val);
    }
    if (isEvent(val)) {
      return res + `${ATTRIBUTE_EVENT_NAME}="true"`;
    }
    if (isProps(val)) {
      if (options?.isPage) {
        windowProps = val.props;
        return (
          res +
          `${ATTRIBUTE_IS_PARENT}="true"` +
          " " +
          `${ATTRIBUTE_PROPS_NAME}="true"`
        );
      } else {
        return res + `${ATTRIBUTE_PROPS_NAME}="true"`;
      }
    }
    if (isShadowRoot(val)) {
      return res + `shadowroot="${val.value}"`;
    }
    if (Array.isArray(val)) {
      return (
        res +
        val.reduce((res, item) => {
          if (!item) {
            return res;
          }
          if (isTemplateResult(item)) {
            res += htmlToString(item);
            return res;
          }
          return res + escapeHTML(String(item));
        }, "")
      );
    }
    if (!val) {
      return res;
    }
    return res + escapeHTML(String(val));
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
  return (
    hasProperties<TemplateResult>(obj, ["$$typeof", "strings", "values"]) &&
    obj.$$typeof === TEMPLATE_RESULT_TYPE &&
    obj.strings &&
    obj.values &&
    Array.isArray(obj.strings) &&
    Array.isArray(obj.values)
  );
};
