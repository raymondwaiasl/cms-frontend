import BrowserRouter from '../router/BrowserRouter';
import './App.css';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ComponentsContextProvider, UserContextProvider } from 'libs/common/src/lib/context';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { RecoilRoot } from 'recoil';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ToastContainer
            limit={3}
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <UserContextProvider>
            <ComponentsContextProvider>
              <BrowserRouter />
              <ReactQueryDevtools />
            </ComponentsContextProvider>
          </UserContextProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
