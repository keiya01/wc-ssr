import { html, $shadowroot } from "wc-ssr";

type Props = {
  article: string;
};

export const template = ({ article }: Props) => html`
  <simple-page>
    <template ${$shadowroot()}>
      <article>
        <h2>Article</h2>
        <p>${article}</p>
      </article>
    </template>
  </simple-page>
`;
