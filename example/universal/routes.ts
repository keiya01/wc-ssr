import type { Routes } from "universal-router";

const render = async (load: () => Promise<any>) => {
  const { getServerSideProps } = await load();
  return await getServerSideProps();
};

export const routes: Routes = [
  {
    path: "/simple",
    action: () => render(() => import("../client/pages/simple")),
  },
  {
    path: "/passing-state-as-props",
    action: () =>
      render(() => import("../client/pages/passing-state-as-props")),
  },
  {
    path: "/todos",
    children: [
      {
        path: "/",
        action: () => render(() => import("../client/pages/todo/index")),
      },
    ],
  },
];
