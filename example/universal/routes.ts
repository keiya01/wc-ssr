import type { RouterContext, Routes } from "universal-router";

type RenderOptions = {
  ctx: RouterContext;
};

const render = async (load: () => Promise<any>, options: RenderOptions) => {
  const { getServerSideProps } = await load();
  if (options.ctx.isInitial) {
    return "";
  }
  return await getServerSideProps();
};

export const routes: Routes = [
  {
    path: "/simple",
    action: (ctx) => render(() => import("../client/pages/simple"), { ctx }),
  },
  {
    path: "/passing-state-as-props",
    action: (ctx) =>
      render(() => import("../client/pages/passing-state-as-props"), { ctx }),
  },
  {
    path: "/interactive-style",
    action: (ctx) =>
      render(() => import("../client/pages/interactive-style"), { ctx }),
  },
  {
    path: "/todos",
    children: [
      {
        path: "/",
        action: (ctx) =>
          render(() => import("../client/pages/todo/index"), { ctx }),
      },
    ],
  },
];
