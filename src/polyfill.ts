import { isCustomElement } from "./html";

export const supportsDeclarativeShadowDOM = (): boolean => {
  return Object.hasOwnProperty.call(
    HTMLTemplateElement.prototype,
    "shadowRoot"
  );
};

export const createTemplateError = (): Error =>
  new Error("<template> element must have `shadowroot` attribute.");

type AttachOptions = {
  shouldSetShadow?: boolean;
};

const recursivelyAppendTemplate = (elm: Element) => {
  const template = elm.querySelector<HTMLTemplateElement>(
    "template[shadowRoot]"
  );
  if(!template) {
    throw createTemplateError();
  }

  elm.appendChild(template.content);
  template.remove();
  Array.from(elm.children).map((child) => {
    if(isCustomElement(child.tagName)) {
      recursivelyAppendTemplate(child);
    }
  });
}

export const attachTemplate = (
  elm: Element,
  { shouldSetShadow = true }: AttachOptions = {}
): ShadowRoot | null => {
  if (!shouldSetShadow) {
    recursivelyAppendTemplate(elm);
    return null;
  }

  const template = elm.querySelector<HTMLTemplateElement>(
    "template[shadowRoot]"
  );

  if (!template) {
    // TODO: should tree shaking
    throw createTemplateError();
  }

  const mode = template.getAttribute("shadowroot") as ShadowRootMode | null;
  if (!mode) {
    // TODO: should tree shaking
    throw createTemplateError();
  }

  const delegatesFocus = template.hasAttribute("shadowrootdelegatesfocus");
  const shadowRoot = elm.attachShadow({ mode, delegatesFocus });
  shadowRoot.appendChild(template.content);

  template.remove();

  return shadowRoot;
};
