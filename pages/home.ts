import { template } from '../client/components/HomePage/template';

type Props = {
  user: {
    name: string,
  }
}

export const getServerSideProps = (props: Props) => {
  return template(props);
}
