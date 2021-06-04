import { $event, $props, html, $shadowroot } from "wc-ssr";
import { Todo } from "../../template";

export type Props = {
  todo: Todo;
  handleToggleCheck?: (id: number) => () => void;
};

export const template = ({ todo, handleToggleCheck }: Props) => html`
  <todo-item ${$props({todo, handleToggleCheck})}>
    <template ${$shadowroot()} shadowrootdelegatesfocus>
      <style>
        li {
           cursor: pointer;
        }
      </style>
      <li ${$event("click", handleToggleCheck?.(todo.id))}>
        ${todo.text}
      </li>
    </template>
</todo-item>
`;
