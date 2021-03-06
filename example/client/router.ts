import UniversalRouter from "universal-router";
import { routes } from "../universal/routes";

const router = new UniversalRouter(routes);

router.resolve({ pathname: window.location.pathname, isInitial: true });

window.addEventListener("popstate", () => {
  // TODO: support CSR
  router.resolve({ pathname: window.location.pathname });
});
