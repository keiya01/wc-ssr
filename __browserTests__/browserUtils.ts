export const IS_FIREFOX = process.env.PUPPETEER_PRODUCT === "firefox";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const waitForShadowRoot = async (
  page: any,
  selector: string
): Promise<void> => {
  await page.evaluate((selector) => {
    let shadowRoot: ShadowRoot;
    while (!shadowRoot) {
      shadowRoot = document.querySelector(selector).shadowRoot;
    }
  }, selector);
};
