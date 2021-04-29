import { template } from '../client/components/HomePage';

export const getServerSideProps = () => {
  return template({ user: { name: 'keiya01' }});
}
