import { IS_FIREFOX, waitForShadowRoot } from "./browserUtils";

describe("simple page", () => {
  it("should render simple-page element", async () => {
    if (IS_FIREFOX) {
      return;
    }

    const page = await browser.newPage();
    await page.goto("http://localhost:3000/simple");

    await page.setJavaScriptEnabled(false);

    // for checking SSR
    await page.reload();

    const textContent = await page.evaluate(() => {
      return document
        .querySelector("simple-page")
        ?.shadowRoot?.querySelector("article > p")?.textContent;
    });

    expect(textContent).toBe("Hello SSR");

    await page.setJavaScriptEnabled(true);

    await page.close();
  });

  it("should hydrate simple-page element", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/simple");

    if (IS_FIREFOX) {
      await waitForShadowRoot(page, "simple-page");
    }

    const textContent = await page.evaluate(() => {
      return document
        .querySelector("simple-page")
        ?.shadowRoot?.querySelector("article > p")?.textContent;
    });

    expect(textContent).toBe("Hello Client");

    await page.close();
  });
});
