import { template } from "../components/SimplePage";

export const getServerSideProps = async () => {
  return template({ article: "Hello SSR" });
};
