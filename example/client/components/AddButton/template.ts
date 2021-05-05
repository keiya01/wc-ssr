import "./element";
import { html, toAttr, $event } from "wc-ssr";

type Props = {
  title: string;
  onClick?: () => void;
};

export const template = ({ onClick, ...props }: Props) => html`
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <button type="button" ${$event("click", onClick)}>${props.title}</button>
    </template>
  </add-button>
`;
