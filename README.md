# wc-ssr

**NOTE: This library is not production ready.**

`wc-ssr` is a simple Server Side Rendering Library with `Web Components`.

## Example

```ts
// client/AddButton/template.ts

import { html, $props, $event } from "wc-ssr";

type Props = {
  title: string;
  onClick?: () => void;
};

export const template = (props: Props) => html`
  ${/* You can pass props with `$props()`. */}
  <add-button ${$props(props)}>
    <template shadowroot="open">
      ${/* You can add event with `$event()`. */}
      <button type="button" ${$event("click", props.onClick)}>
        ${props.title}
      </button>
    </template>
  </add-button>
`;

```

```ts
// client/AddButton/element.ts

import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class AddButton extends BaseElement {
  constructor() {
    super();
  }

  render() {
    // `props` is injected to `this.props`.
    return template({
      title: this.props.title,
      onClick: this.props.onClick,
    });
  }
}

customElements.define("add-button", AddButton);

```

**NOTE: If you want to use SSR feature, you should remove `import './element'` like [this example](https://github.com/keiya01/wc-ssr/blob/master/example/babel.config.js#L10-L17).**
```ts
// client/AddButton/index.ts

import './element';
export { template } from './template';
```

```ts
// page.ts

import { html } from 'wc-ssr';
import { template as AddButton } from './client/AddButton';

export const renderPage = () => html`
  <div>
    <h1>Hello World!</h1>
    ${AddButton({ title: 'button', onClick: () => console.log('clicked!') })}
  </div>
  `;
}
```

```ts
import fastify, { FastifyInstance } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { htmlToString } from "wc-ssr";
import { renderPage } from './page';

type App = FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse,
>;

const start = async () => {
  const app = fastify();

  app.get("/example", async (req, reply) => {
    reply.header("Content-Type", "text/html; charset=utf-8");
    reply.send(`
      <DOCTYPE!>
      <html>
        <body>
          ${htmlToString(renderPage())}
        </body>
      </html>
    `);
    );
  });

  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

```

See detail in [example](https://github.com/keiya01/wc-ssr/tree/master/example).

## Usage

### Props

*TODO*

### State

*TODO*

### Event

*TODO*

### Attribute

*TODO*

### Lifecycle

### Hydration

*TODO*

### Server Side Rendering

*TODO*
