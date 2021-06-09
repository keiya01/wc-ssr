/**
 * These types will preserve XSS.
 * example: https://github.com/facebook/react/blob/1a3f1afbd3cf815d4e55628cd7d84ef20171bab8/packages/shared/ReactSymbols.js
 * description: https://overreacted.io/why-do-react-elements-have-typeof-property/
 */
export const ATTRIBUTE_EVENT_TYPE = Symbol.for("event");
export const ATTRIBUTE_PROPS_TYPE = Symbol.for("props");
export const ATTRIBUTE_SHADOW_ROOT_TYPE = Symbol.for("shadowroot");
export const TEMPLATE_RESULT_TYPE = Symbol.for("template-result");
