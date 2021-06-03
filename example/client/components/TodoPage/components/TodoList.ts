import { html, TemplateResult } from "wc-ssr";
import { Todo } from "../template";
import { template as TodoItem } from "./TodoItem";

type Props = { todos: Todo[]; handleToggleCheck?: (id: number) => () => void };

export const TodoList = ({
  todos,
  handleToggleCheck,
}: Props): TemplateResult => html`
  <ul>
    ${todos.map(
      (todo) => TodoItem({ todo, handleToggleCheck })
    )}
  </ul>
`;
