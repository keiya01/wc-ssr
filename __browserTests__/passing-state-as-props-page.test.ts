import { IS_FIREFOX, waitForShadowRoot } from "./browserUtils";

describe("passing state as props page", () => {
  it("should be added event listener", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/passing-state-as-props");
    const getButtonTextContent = async () =>
      await page.evaluate(() => {
        const homePage = document.querySelector("passing-state-as-props-page")
          ?.shadowRoot;
        return homePage
          ?.querySelector("add-button")
          ?.shadowRoot?.querySelector("button")?.innerText;
      });
    const clickButton = async () =>
      await page.evaluate(() => {
        const homePage = document.querySelector("passing-state-as-props-page")
          ?.shadowRoot;
        return homePage
          ?.querySelector("add-button")
          ?.shadowRoot?.querySelector("button")
          ?.click();
      });

    if(IS_FIREFOX) {
      await waitForShadowRoot(page, 'passing-state-as-props-page');
    }

    expect(await getButtonTextContent()).toBe("hey");
    await clickButton();
    expect(await getButtonTextContent()).toBe("1");
    await clickButton();
    expect(await getButtonTextContent()).toBe("2");

    await page.close();
  });
});
