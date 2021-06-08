import { IS_FIREFOX } from "./browserUtils";

describe("interactive style page", () => {
  it("should render interactive-style element", async () => {
    if (IS_FIREFOX) {
      return;
    }

    const page = await browser.newPage();
    await page.goto("http://localhost:3000/interactive-style");

    const getDialogStateClassName = async () =>
      await page.evaluate(() =>
        document
          .querySelector("interactive-style")
          ?.shadowRoot?.querySelector("div > .dialog")
          .classList.item(1)
      );

    expect(await getDialogStateClassName()).toBe("close-dialog");

    await page.evaluate(() => {
      return document
        .querySelector("interactive-style")
        ?.shadowRoot?.querySelector("button")
        ?.click();
    });

    expect(await getDialogStateClassName()).toBe("open-dialog");

    await page.close();
  });
});
