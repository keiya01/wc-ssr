import 'expect-puppeteer';

describe('simple page', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000/simple');
  });

  it('should render simple-page element', async () => {
    await page.setJavaScriptEnabled(false);

    // for checking SSR
    await page.reload();

    const textContent = await page.evaluate(() => {
      return document.querySelector('simple-page')?.shadowRoot?.querySelector('article > p')?.textContent;
    });
    expect(textContent).toBe("Hello SSR");

    await page.setJavaScriptEnabled(true);
  });

  it('should hydrate simple-page element', async () => {
    const textContent = await page.evaluate(() => {
      return document.querySelector('simple-page')?.shadowRoot?.querySelector('article > p')?.textContent;
    });
    expect(textContent).toBe("Hello Client");
  });
});

describe('passing state as props page', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000/passing-state-as-props');
  });

  it('should be added event listener', async () => {
    const getButtonTextContent = async () => await page.evaluate(() => {
      const homePage = document.querySelector('passing-state-as-props-page')?.shadowRoot;
      return homePage?.querySelector('add-button')?.shadowRoot?.querySelector('button')?.innerText;
    });
    const clickButton = async () => await page.evaluate(() => {
      const homePage = document.querySelector('passing-state-as-props-page')?.shadowRoot;
      return homePage?.querySelector('add-button')?.shadowRoot?.querySelector('button')?.click();
    });
    expect(await getButtonTextContent()).toBe("hey");
    await clickButton();
    expect(await getButtonTextContent()).toBe("1");
    await clickButton();
    expect(await getButtonTextContent()).toBe("2");
  });
});
