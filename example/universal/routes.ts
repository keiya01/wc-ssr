import type { Routes } from "universal-router";

const render = async (load: () => Promise<any>) => {
  const { getServerSideProps } = await load();
  return await getServerSideProps();
};

export const routes: Routes = [
  { path: "/home", action: () => render(() => import("../client/pages/home")) },
];
