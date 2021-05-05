import './element';
import { html, toAttr, $event } from "wc-ssr";

type Props = {
  title: string;
}

export const template = (props: Props) => html`
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <button type="button" ${$event('click', () => {})}>${props.title}</button>
    </template>
  </add-button>
`;
