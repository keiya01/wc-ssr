export * from "./template";
if (IS_CLIENT) {
  import(/* webpackMode: "eager" */ "./element");
}
