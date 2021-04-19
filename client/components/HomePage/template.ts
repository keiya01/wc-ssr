import { template as AddButton } from '../AddButton';

type Props = {
  user: {
    name: string,
  }
};

export const template = (props: Props) => `
  <home-page>
    <template shadowroot="open">
      <article>
        <h2>Article1</h2>
        <p>hello declarative shadow dom!</p>
        <span>Data: ${props.user.name}</span>
      </article>
      ${AddButton({})}
    </template>
  </home-page>
`;
