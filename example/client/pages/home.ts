import { template } from "../components/HomePage";

export const getServerSideProps = async () => {
  return template({ user: { name: "keiya01" }, article: "Hello SSR" });
};
