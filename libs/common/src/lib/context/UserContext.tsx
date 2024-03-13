import Client from '../api/client';
import axios, { AxiosResponse } from 'axios';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: process.env['NX_API_URL'],
  headers: {
    Authorization: undefined,
  },
});
const initialState: UserContextType = {
  properties: {
    token: sessionStorage.getItem('token') ?? localStorage.getItem('token'),
  },
  setProperties: () => {},
  client: new Client(API, (error) => toast.error(error)),
};
const UserContext = createContext(initialState);
const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [properties, setProperties] = useState<UserContextType['properties']>({
    currentLang: 'EN',
    token: sessionStorage.getItem('token') ?? localStorage.getItem('token'),
  });

  useEffect(() => {
    if (sessionStorage.getItem('token') || localStorage.getItem('token')) {
      console.log('get token');
      setProperties((curr) => ({
        ...curr,
        token: sessionStorage.getItem('token') ?? localStorage.getItem('token'),
      }));
    }
  }, [sessionStorage.getItem('token'), localStorage.getItem('token')]);

  const setUserProperties = (newProperties: UserContextType['properties']) => {
    setProperties(newProperties);
  };
  const client = useMemo(() => {
    console.log(properties.token);
    const API = axios.create({
      baseURL: process.env['NX_API_URL'],
    });
    API.defaults.headers.common['Authorization'] = properties.token ?? undefined;
    // API.interceptors.response.use(
    //   (response:AxiosResponse) => {
    //     if (!(response.data instanceof Blob) && response.data.code !== 200) {
    //       toast.error(response.data.msg);
    //       return Promise.reject(response.data);
    //     }

    //     console.log(response);
    //     return response.data;
    //   },
    //   (error) => {
    //     console.log(error);
    //     if (error.code === 'ERR_NETWORK') {
    //       toast.error(error.message);
    //       return Promise.reject(error);
    //     }
    //     console.log(error.response.status);
    //     if (error.response.status === 403) {
    //       window.location.pathname = '/login';
    //       localStorage.removeItem('token');
    //       sessionStorage.removeItem('token');
    //     }
    //     toast.error(error.response.data.msg);
    //     return Promise.reject(error);
    //   }
    // );
    return new Client(API, (error) => toast.error(error));
  }, [properties.token]);
  const authValue = useMemo(
    () => ({
      properties,
      setProperties: setUserProperties,
      client,
    }),
    [properties]
  );
  return <UserContext.Provider value={authValue}>{children}</UserContext.Provider>;
};

// export const ResInterceptor=

export type UserContextType = {
  properties: { token?: string | null; [key: string]: any };
  setProperties: (props: UserContextType['properties']) => void;
  client: Client;
};
export type UserContextProviderProps = {
  children: ReactNode;
};

export { UserContext, UserContextProvider };
