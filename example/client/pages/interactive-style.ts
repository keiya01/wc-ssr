import { template } from "../components/InteractiveStyle";

export const getServerSideProps = async () => {
  return template({ isOpenDialog: false });
};
