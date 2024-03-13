import route from '../../router/route';
import styles from './login-page.module.scss';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
} from '@mui/material';
import jwt_decode from 'jwt-decode';
import { UserContext } from 'libs/common/src/lib/context';
import { useApi } from 'libs/common/src/lib/hooks';
import { useContext, useEffect, useState,useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye as Visibility, AiFillEyeInvisible as VisibilityOff } from 'react-icons/ai';
import { useMutation,useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const client = useApi();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: 'onBlur' });
  const history = useHistory();
  const { properties, setProperties } = useContext(UserContext);
  const Login = useMutation(client.loginService.login);
  const isOpenDialog=useRef(false);
  const submitHandling = async (formData: any) => {
    Login.mutate(
      {
        loginName: formData.loginName,
        pwd: formData.password,
        loginType: '1',
      },
      {
        onSuccess: ({ data: loginData }) => {
          console.log(loginData);
          const decodedToken: any = jwt_decode(loginData.token);
          console.log('decodedToken===================', decodedToken);
          console.log('decodedToken.userId===================', decodedToken.userId);
          console.log('loginData.is_admin===================', loginData.is_admin);

          // if (decodedToken != undefined) {
          sessionStorage.setItem('userId', decodedToken.userId);
          localStorage.setItem('userId', decodedToken.userId);
          if (!formData.rememberUser) {
            sessionStorage.setItem('token', loginData.token);
            sessionStorage.setItem('token_expire_time', loginData.expire_time.toString());
          }
          if (formData.rememberUser) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('token_expire_time', loginData.expire_time.toString());
          }
          if (loginData) {
            setProperties({ ...properties, token: loginData.token as string });
          }
          history.push(route.home);
          toast('login Successfully', {
            type: 'success',
          });
          // } else {
          //   toast('login is not admin', {
          //     type: 'error',
          //   });
          // }
         
          
        },
        onError: (error: any) => {
          console.log(error);
        },
      }
    );
  };
  useEffect(() => {
    if (properties.token) {
      history.push(route.home);
    }
  }, [properties.token]);

  // const { data: welcomeData, isLoading } = useQuery(['useradmin'], async () => {
  //   const { data: response } = await client.welcomePage.getWelcome();
  //   return response;
  // });

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit(submitHandling)}>
        <div style={{ marginBottom: '40px', fontSize: 20, textAlign: 'center' }}>
          Admin Portal Login
        </div>
        <Stack
          sx={{
            display: 'flex',
            width: matches ? 'auto' : '400px',
            fontSize: 20,
            textAlign: 'center',
            flexDirection: 'column',
            marginBottom: '40px',
          }}
        >
          <Controller
            name="loginName"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <FormControl>
                <InputLabel error={!!errors.loginName} htmlFor="emailAddress">
                  Login Name
                </InputLabel>
                <OutlinedInput
                  id="username"
                  className={styles.input}
                  {...field}
                  error={!!errors.loginName}
                  label="Email address"
                />
              </FormControl>
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <FormControl>
                <InputLabel error={!!errors.password} htmlFor="password">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="password"
                  disableInjectingGlobalStyles
                  className={styles.input}
                  {...field}
                  label="password"
                  error={!!errors.password}
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end" style={{ marginBottom: 0 }}>
                      <IconButton
                        sx={{ padding: 0 }}
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(evt) => {
                          evt.preventDefault();
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            )}
          />
          <Controller
            name="rememberUser"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox size="small" {...field} />}
                label="Remember me"
                className={styles.checkbox}
              />
            )}
          />
        </Stack>

        <Button
          variant="contained"
          type="submit"
          disabled={!isValid}
          sx={{
            padding: '12px 24px',
            borderRadius: '80px',
            marginBottom: '24px',
            backgroundColor: '#255390',
          }}
        >
          Login
        </Button>
        <Button
          variant="text"
          sx={{ color: '#255390', textDecoration: 'underline', textTransform: 'none' }}
        >
          Forgot Password?
        </Button>
      </form>
    </div>
  );
  
};
export default LoginPage;
