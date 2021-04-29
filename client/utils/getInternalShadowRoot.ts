export const getInternalShadowRoot = (elm: HTMLElement) => {
  // @ts-ignore
  const internals = elm.attachInternals();
  return internals.shadowRoot as ShadowRoot;
};
