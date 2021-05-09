import { html } from "wc-ssr";
import { template as AddButton } from "../AddButton";

type Props = {
  title?: string;
  handleOnClick?: () => void;
};

export const template = ({ title, handleOnClick }: Props = {}) => html`
  <passing-state-as-props-page>
    <template shadowroot="open">
      ${AddButton({ title: title || "hey", onClick: handleOnClick })}
    </template>
  </passing-state-as-props-page>
`;
