import UniversalRouter from "universal-router";
import { routes } from "../universal/routes";

const router = new UniversalRouter(routes);

router.resolve({ pathname: window.location.pathname });

window.addEventListener("popstate", () => {
  router.resolve({ pathname: window.location.pathname });
});
