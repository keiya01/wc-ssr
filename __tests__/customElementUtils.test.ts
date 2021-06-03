import { isCustomElement } from "../src/customElementUtils";

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
