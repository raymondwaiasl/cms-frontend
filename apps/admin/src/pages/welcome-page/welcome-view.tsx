
import { useApi, useDialog } from 'libs/common/src/lib/hooks';

import { useForm } from 'react-hook-form';
import {  useQuery} from 'react-query';
import { useHistory } from 'react-router-dom';


const WelcomeView = () => {


  const client = useApi();

  const { data: welcomeData, isLoading } = useQuery(['useradmin'], async () => {
    const { data: response } = await client.welcomePage.getWelcome();
    return response;
  });

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: welcomeData }}></div>
    </>
  );
};

export default WelcomeView;
