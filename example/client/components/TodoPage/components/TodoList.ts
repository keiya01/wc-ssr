import { html, $event, TemplateResult } from "wc-ssr";
import { Todo } from "../template";

type Props = { todos: Todo[]; handleToggleCheck?: (id: number) => () => void };

export const TodoList = ({
  todos,
  handleToggleCheck,
}: Props): TemplateResult => html`
  <ul>
    ${todos.map(
      (todo) => html` <li ${$event("click", handleToggleCheck?.(todo.id))}>
        ${todo.text}
      </li>`
    )}
  </ul>
`;
