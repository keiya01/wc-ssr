import { $event, $props } from "../src/attribute";
import {
  ATTRIBUTE_EVENT_NAME,
  ATTRIBUTE_PROPS_NAME,
  html,
  htmlToString,
  isCustomElement,
} from "../src/html";

describe("htmlToString()", () => {
  it("should convert TemplateResult to html string", () => {
    // prettier-ignore
    const template = html`<div><h1>Hello World</h1></div>`;
    expect(htmlToString(template)).toBe("<div><h1>Hello World</h1></div>");
  });

  it("should convert TemplateResult that has event to html string", () => {
    // prettier-ignore
    const template = html`<div><button ${$event("click", () => console.log("Hello World"))}>submit</button></div>`;
    expect(htmlToString(template)).toBe(
      `<div><button data-${ATTRIBUTE_EVENT_NAME}="true">submit</button></div>`
    );
  });

  it("should convert TemplateResult that has props to html string", () => {
    // prettier-ignore
    const template = html`<custom-element ${$props({ key: "test", hello: "world" })}><template shadowroot="open"><h1>Hello World</h1></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element data-${ATTRIBUTE_PROPS_NAME}="true"><template shadowroot="open"><h1>Hello World</h1></template></custom-element>`
    );
  });

  it("should convert TemplateResult that has TemplateResult to html string", () => {
    // prettier-ignore
    const templateChild = html`<custom-element-child ${$props({ key: "test", hello: "world" })}><template shadowroot="open"><h1>Hello Child</h1></template></custom-element-child>`;
    // prettier-ignore
    const template = html`<custom-element><template shadowroot="open"><div><h1>Hello World</h1>${templateChild}</div></template></custom-element>`;

    const expectStringTemplateChild = `<custom-element-child data-${ATTRIBUTE_PROPS_NAME}="true"><template shadowroot="open"><h1>Hello Child</h1></template></custom-element-child>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><div><h1>Hello World</h1>${expectStringTemplateChild}</div></template></custom-element>`
    );
  });
});

describe("isCustomElement()", () => {
  it("should be true when it is custom element", () => {
    expect(isCustomElement("custom-element")).toBeTruthy();
  });

  it("should be true when it is custom element", () => {
    expect(isCustomElement("custom-element_child-element.test")).toBeTruthy();
  });

  it("should be true when it is custom element", () => {
    expect(isCustomElement("custom-")).toBeTruthy();
  });

  it("should be false when it is div", () => {
    expect(isCustomElement("div")).toBeFalsy();
  });

  it("should be false when it is invalid custom element", () => {
    expect(isCustomElement("-element")).toBeFalsy();
  });
});
