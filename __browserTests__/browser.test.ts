import "expect-puppeteer";

describe("simple page", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3000/simple");
  });

  it("should render simple-page element", async () => {
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
  });

  it("should hydrate simple-page element", async () => {
    const textContent = await page.evaluate(() => {
      return document
        .querySelector("simple-page")
        ?.shadowRoot?.querySelector("article > p")?.textContent;
    });
    expect(textContent).toBe("Hello Client");
  });
});
