import axios from 'axios';

const Api = axios.create({ baseURL: process.env['NX_API_URL'] });

Api.interceptors.response.use(
  (response) => {
    console.log(response);
    if (response.data.code === 300) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    console.log(error);
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({ data: error.message });
    }

    if (error.response.status === 403) {
      window.location.href = '/login';
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default Api;
