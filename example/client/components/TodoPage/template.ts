import { $event, $props, html, TemplateResult } from "wc-ssr";
import { TodoList } from "./components/TodoList";

export type Todo = { id: number; text: string; isChecked: boolean };

export type Props = {
  todos: Todo[];
  checkedTodos: Todo[];
  nonCheckedTodos: Todo[];
  text?: string;
  handleChangeTodo?: (ev?: InputEvent) => void;
  handleAddTodo?: () => void;
  handleToggleCheck?: (id: number) => () => void;
};

const style = html`
  <style>
    h1 {
      color: blue;
    }
    .wrapper {
      display: flex;
    }
  </style>
`;

/**
 * TODO
 * - client side rendering を行うTODOアプリを作ってみる
 * - todoの追加・編集・削除は同一ページで行う
 * - チェックしたtodoは別ページで表示する
 */
export const template = ({
  todos,
  checkedTodos,
  nonCheckedTodos,
  text,
  handleChangeTodo,
  handleAddTodo,
  handleToggleCheck,
}: Props): TemplateResult => html`
  <todo-page ${$props({ todos, checkedTodos, nonCheckedTodos })}>
    <template shadowroot="open">
      ${style}
      <div class="container">
        <h1>TODO</h1>
        <div class="wrapper">
          ${TodoList({ todos: nonCheckedTodos, handleToggleCheck })}
          ${TodoList({ todos: checkedTodos, handleToggleCheck })}
        </div>
        <input
          name="todo"
          ${$event("input", handleChangeTodo)}
          value="${text || ""}"
        />
        <button ${$event("click", handleAddTodo)}>add todo</button>
      </div>
    </template>
  </todo-page>
`;
