import { UserContext } from '../context';
import { useContext } from 'react';

const useApi = () => {
  const { client } = useContext(UserContext);

  return client;
};

export default useApi;
