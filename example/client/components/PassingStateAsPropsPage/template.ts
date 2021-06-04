import { html, $shadowroot } from "wc-ssr";
import { template as AddButton } from "../AddButton";

type Props = {
  title?: string;
  handleOnClick?: () => void;
};

export const template = ({ title, handleOnClick }: Props = {}) => html`
  <passing-state-as-props-page>
    <template ${$shadowroot()}>
      ${AddButton({ title: title || "hey", onClick: handleOnClick })}
    </template>
  </passing-state-as-props-page>
`;
