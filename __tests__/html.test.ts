import { $event, $props, $shadowroot } from "../src/attribute";
import {
  ATTRIBUTE_EVENT_NAME,
  ATTRIBUTE_PROPS_NAME,
  html,
  htmlToString,
} from "../src/html";
import { escapeHTML } from "../src/escapeHTML";

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
      `<div><button ${ATTRIBUTE_EVENT_NAME}="true">submit</button></div>`
    );
  });

  it("should convert TemplateResult that has props to html string", () => {
    // prettier-ignore
    const template = html`<custom-element ${$props({ key: "test", hello: "world" })}><template shadowroot="open"><h1>Hello World</h1></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element ${ATTRIBUTE_PROPS_NAME}="true"><template shadowroot="open"><h1>Hello World</h1></template></custom-element>`
    );
  });

  it("should convert TemplateResult that has TemplateResult to html string", () => {
    // prettier-ignore
    const templateChild = html`<custom-element-child ${$props({ key: "test", hello: "world" })}><template shadowroot="open"><h1>Hello Child</h1></template></custom-element-child>`;
    // prettier-ignore
    const template = html`<custom-element><template shadowroot="open"><div><h1>Hello World</h1>${templateChild}</div></template></custom-element>`;

    const expectStringTemplateChild = `<custom-element-child ${ATTRIBUTE_PROPS_NAME}="true"><template shadowroot="open"><h1>Hello Child</h1></template></custom-element-child>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><div><h1>Hello World</h1>${expectStringTemplateChild}</div></template></custom-element>`
    );
  });

  it("should convert html array", () => {
    // prettier-ignore
    const template = html`<custom-element><template shadowroot="open"><ul>${["abc", "def", "ghi"].map((text) => html`<li>${text}</li>`)}</ul></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><ul><li>abc</li><li>def</li><li>ghi</li></ul></template></custom-element>`
    );
  });

  it("should convert string array", () => {
    // prettier-ignore
    const template = html`<custom-element><template shadowroot="open"><span>${["abc", "def", "ghi"]}</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>abcdefghi</span></template></custom-element>`
    );
  });

  it("should be filtered null in array", () => {
    // prettier-ignore
    const template = html`<custom-element><template shadowroot="open"><span>${["abc", "def", null, "ghi"]}</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>abcdefghi</span></template></custom-element>`
    );
  });

  it("should be inserted shadowroot", () => {
    // prettier-ignore
    const template = html`<custom-element><template ${$shadowroot()}><span>shadowroot</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>shadowroot</span></template></custom-element>`
    );
  });

  it("should be escaped html", () => {
    const xss = `<script>alert('XSS')</script>`;
    // prettier-ignore
    const template = html`<custom-element><template ${$shadowroot()}><span>${xss}</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>${escapeHTML(
        xss
      )}</span></template></custom-element>`
    );
  });

  it("should be escaped TemplateResult", () => {
    const xss = {
      $$typeof: "template-result",
      strings: ['<script>alert("XSS")</script>'],
      values: [],
    };
    // prettier-ignore
    const template = html`<custom-element><template ${$shadowroot()}><span>${xss}</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>${escapeHTML(
        String(xss)
      )}</span></template></custom-element>`
    );
  });

  it("should be escaped event", () => {
    const xss = {
      $$typeof: "event",
      eventName: "click",
      handler: () => console.log("XSS"),
    };
    // prettier-ignore
    const template = html`<custom-element><template ${$shadowroot()}><button ${xss}>click me</button></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><button ${escapeHTML(
        String(xss)
      )}>click me</button></template></custom-element>`
    );
  });

  it("should be escaped props", () => {
    const xss = {
      $$typeof: "props",
      props: { xss: "XSS" },
    };
    // prettier-ignore
    const template = html`<custom-element ${xss}><template ${$shadowroot()}><span>Hello World</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element ${escapeHTML(
        String(xss)
      )}><template shadowroot="open"><span>Hello World</span></template></custom-element>`
    );
  });

  it("should be escaped shadowroot", () => {
    const xss = {
      $$typeof: "shadowroot",
      value: `close" onclick="alert('CSS')`,
    };
    // prettier-ignore
    const template = html`<custom-element><template ${xss}><span>Hello World</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template ${escapeHTML(
        String(xss)
      )}><span>Hello World</span></template></custom-element>`
    );
  });

  it("should be escaped html with array", () => {
    const xss = [
      {
        $$typeof: "template-result",
        strings: ['<script>alert("XSS")</script>'],
        values: [],
      },
      `<script>alert('XSS')</script>`,
    ];
    // prettier-ignore
    const template = html`<custom-element><template ${$shadowroot()}><span>${xss}</span></template></custom-element>`;
    expect(htmlToString(template)).toBe(
      `<custom-element><template shadowroot="open"><span>${escapeHTML(
        String(xss[0])
      )}${escapeHTML(String(xss[1]))}</span></template></custom-element>`
    );
  });
});
