import './element';
import { AttrProps, toAttr } from "../../utils/toAttr";

const style = `
  
`;

export const template = (props: AttrProps) => `
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <style>${style}</style>
      <button type="button">button</button>
    </template>
  </add-button>
`;
