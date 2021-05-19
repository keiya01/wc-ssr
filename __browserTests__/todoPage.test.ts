const todos = [
  { text: "todo1", isChecked: false },
  { text: "todo2", isChecked: false },
  { text: "todo3", isChecked: true },
  { text: "todo4", isChecked: false },
  { text: "todo5", isChecked: true },
];

describe("todo page", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3000/todos/");
  });

  it("should be added todo", async () => {
    const changeInput = async () => {
      await page.evaluate(() => {
        const todoPage = document.querySelector("todo-page")?.shadowRoot;
        return (todoPage?.querySelector(
          "input[name='todo']"
        ) as HTMLInputElement)?.focus();
      });
      await page.keyboard.type("hello");
    };
    const clickAddButton = async () =>
      await page.evaluate(() => {
        const todoPage = document.querySelector("todo-page")?.shadowRoot;
        return todoPage?.querySelector("button").click();
      });

    const getInputValue = async () =>
      await page.evaluate(() => {
        const todoPage = document.querySelector("todo-page")?.shadowRoot;
        return (todoPage?.querySelector(
          'input[name="todo"]'
        ) as HTMLInputElement)?.value;
      });

    expect(await getInputValue()).toBe("");
    await changeInput();
    expect(await getInputValue()).toBe("hello");
    await clickAddButton();
    expect(await getInputValue()).toBe("");

    const contentList = await page.evaluate(() => {
      const todoPage = document.querySelector("todo-page")?.shadowRoot;
      const ul = todoPage.querySelector("ul");
      return Array.from(ul.children).map(
        (item) => (item as HTMLLIElement).innerText
      );
    });
    todos.map((todo, i) => {
      expect(contentList[i]).toBe(todo.text);
    });
    expect(contentList.slice(-1)[0]).toBe("hello");
  });

  it.todo("should be removed");
  it.todo("should be moved");
  it.todo("should be checked");
});
