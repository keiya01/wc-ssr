import { hasProperties } from "../attribute";

describe("hasProperties()", () => {
  it("should be true", () => {
    const obj = { key: "value", hello: "world" };
    expect(
      hasProperties<typeof obj>({ key: "value", hello: "world" }, [
        "key",
        "hello",
      ])
    ).toBeTruthy();
  });
});
