import './element';
import { AttrProps, toAttr } from "../../utils/toAttr";

export const template = (props: AttrProps) => `
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <button type="button">button</button>
    </template>
  </add-button>
`;
