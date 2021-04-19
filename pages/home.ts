import { template } from '../client/components/HomePage';

type Props = {
  user: {
    name: string,
  }
}

export const getServerSideProps = (props: Props) => {
  return template(props);
}
