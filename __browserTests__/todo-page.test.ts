import { IS_FIREFOX, waitForShadowRoot } from "./browserUtils";

const todos = [
  { text: "todo1", isChecked: false },
  { text: "todo2", isChecked: false },
  { text: "todo3", isChecked: true },
  { text: "todo4", isChecked: false },
  { text: "todo5", isChecked: true },
];

describe("todo page", () => {
  it("should be added", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/todos/");

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

    if (IS_FIREFOX) {
      await waitForShadowRoot(page, "todo-page");
    }

    expect(await getInputValue()).toBe("");
    await changeInput();
    expect(await getInputValue()).toBe("hello");
    await clickAddButton();
    expect(await getInputValue()).toBe("");

    const [todosContentList, checkedTodosContentList] = await page.evaluate(
      () => {
        const todoPage = document.querySelector("todo-page")?.shadowRoot;
        const allSelectors = todoPage.querySelectorAll("ul");
        const todos = allSelectors[0];
        const checkedTodos = allSelectors[1];
        return [
          Array.from(todos.children).map(
            (item) =>
              (item as HTMLLIElement).shadowRoot.querySelector("li").innerText
          ),
          Array.from(checkedTodos.children).map(
            (item) =>
              (item as HTMLLIElement).shadowRoot.querySelector("li").innerText
          ),
        ];
      }
    );

    const nonCheckedTodos = todos.filter((todo) => !todo.isChecked);
    const checkedTodos = todos.filter((todo) => todo.isChecked);
    nonCheckedTodos.map((todo, i) =>
      expect(todosContentList[i]).toBe(todo.text)
    );
    checkedTodos.map((todo, i) =>
      expect(checkedTodosContentList[i]).toBe(todo.text)
    );
    expect(todosContentList.slice(-1)[0]).toBe("hello");

    await page.close();
  });

  it("should be checked", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/todos/");

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

    const getAllTodos = async () =>
      await page.evaluate(() => {
        const todoPage = document.querySelector("todo-page")?.shadowRoot;
        const allSelectors = todoPage.querySelectorAll("ul");
        const todos = allSelectors[0];
        const checkedTodos = allSelectors[1];
        return [
          Array.from(todos.children).map(
            (item) =>
              (item as HTMLLIElement).shadowRoot.querySelector("li").innerText
          ),
          Array.from(checkedTodos.children).map(
            (item) =>
              (item as HTMLLIElement).shadowRoot.querySelector("li").innerText
          ),
        ];
      });

    if (IS_FIREFOX) {
      await waitForShadowRoot(page, "todo-page");
    }

    await changeInput();
    await clickAddButton();

    await page.evaluate(() => {
      const todoPage = document.querySelector("todo-page")?.shadowRoot;
      const list = Array.from(todoPage?.querySelectorAll("todo-item"));
      return list[3].shadowRoot?.querySelector("li").click();
    });

    const testCheckedTodos = async () => {
      const nonCheckedTodos = todos.filter((todo) => !todo.isChecked);
      const checkedTodos = todos.filter((todo) => todo.isChecked);
      const [todosContentList, checkedTodosContentList] = await getAllTodos();
      nonCheckedTodos.map((todo, i) =>
        expect(todosContentList[i]).toBe(todo.text)
      );
      checkedTodos.map((todo, i) =>
        expect(checkedTodosContentList[i]).toBe(todo.text)
      );
      expect(checkedTodosContentList.slice(-1)[0]).toBe("hello");
    };

    await testCheckedTodos();

    await page.evaluate(() => {
      const todoPage = document.querySelector("todo-page")?.shadowRoot;
      const list = Array.from(todoPage?.querySelectorAll("todo-item"));
      return list[3].shadowRoot.querySelector("li").click();
    });

    todos[2].isChecked = false;

    await testCheckedTodos();

    await page.close();
  });
});
