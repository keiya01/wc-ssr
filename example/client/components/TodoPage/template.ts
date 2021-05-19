import { $event, $props, html } from "wc-ssr";

export type Todo = { text: string; isChecked: boolean };

export type Props = {
  todos: Todo[];
  text?: string;
  handleChangeTodo?: (ev?: InputEvent) => void;
  handleAddTodo?: () => void;
};

/**
 * TODO
 * - client side rendering を行うTODOアプリを作ってみる
 * - todoの追加・編集・削除は同一ページで行う
 * - チェックしたtodoは別ページで表示する
 */
export const template = ({
  todos,
  text,
  handleChangeTodo,
  handleAddTodo,
}: Props) => html`
  <todo-page ${$props({ todos })}>
    <template shadowroot="open">
      <div>
        <h1>TODO</h1>
        <ul>
          ${todos.map((todo) => html`<li>${todo.text}</li>`)}
        </ul>
        <input
          name="todo"
          ${$event("input", handleChangeTodo)}
          value=${text || ""}
        />
        <button ${$event("click", handleAddTodo)}>add todo</button>
      </div>
    </template>
  </todo-page>
`;
