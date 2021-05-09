import { hasProperties } from "../src/utils";

describe("hasProperties()", () => {
  it("should be true", () => {
    const obj = { key: "value", hello: "world" };
    expect(
      hasProperties<typeof obj>(obj, ["key", "hello"])
    ).toBeTruthy();
  });

  it("should be false", () => {
    expect(
      hasProperties({ key: "value", hello: "world" }, ["key", "hell"])
    ).toBeFalsy();
  });
});
