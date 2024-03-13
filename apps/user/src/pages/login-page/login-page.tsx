import ConfirmationToast from '../../components/atoms/Navbar/a';
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
} from '@mui/material';
import jwt_decode from 'jwt-decode';
import { UserContext } from 'libs/common/src/lib/context';
import { useApi, useDialog} from 'libs/common/src/lib/hooks';
import { useContext, useEffect, useState,useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye as Visibility, AiFillEyeInvisible as VisibilityOff } from 'react-icons/ai';
import { useMutation, useQueryClient,useQuery } from 'react-query';
import {  useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  // const { setValue: setLocalToken } = useLocalStorage('token');
  // const { setValue: setTemoporaryToken } = useSessionStorage('token');
  const client = useApi();
  const [showPassword, setShowPassword] = useState(false);
  const { openDialog } = useDialog();
  const userContext = useMutation(
    async () => {
      const { data: response } = await client.userService.getContextByUserId();
      return response;
    },
    {
      onSuccess: (data) => {
        console.log(data);
        queryClient.setQueryData('userContext', data);
        if (data) {
          const list = data
            .map((item) => (item.children.length > 0 ? item.children : [item]))
            .flat()
            .sort((a, b) => a.sort - b.sort);
          console.log(list);
          list.length > 0 ? history.push(list[0].to) : history.push('/dashboard');
        }
      },
    }
  );
  const Login = useMutation(client.loginService.login);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: 'onBlur' });
  const history = useHistory();
  const { properties, setProperties } = useContext(UserContext);
  const submitHandling = async (formData: any) => {
    Login.mutate(
      {
        loginName: formData.loginName,
        pwd: formData.password,
        loginType: '2',
      },
      {
        onSuccess: ({ data: loginData }) => {
          console.log('loginData===================', loginData?.is_change);

          const decodedToken: any = jwt_decode(loginData.token);
          sessionStorage.setItem('userId', decodedToken.userId);
          localStorage.setItem('userId', decodedToken.userId);
          if (!formData.rememberUser) {
            // setTemoporaryToken(loginData.token);
            sessionStorage.setItem('token', loginData.token);
            sessionStorage.setItem('token_expire_time', loginData.expire_time.toString());
            sessionStorage.setItem('userName', loginData.user_name);
          }
          if (formData.rememberUser) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('token_expire_time', loginData.expire_time.toString());
            localStorage.setItem('userName', loginData.user_name);
          }
          if (loginData.is_change) {
            //
            showToast(
              'Please click the Confirm button to change your password',
              handleConfirm,
              handleCancel
            );
          }
          if (loginData) {
            setProperties({ ...properties, token: loginData.token });
          }
          toast('login Successfully', {
            type: 'success',
          });
          openDialog('tipsDialog', {
            title: 'Login Tips',
            message: loginData.login_tips,
            confirmAction: () => {}
          });
        },
        onError: (error: any) => {
          console.log(error.data);
          toast(error.data, {
            type: 'info',
          });
        },
      }
    // );
    //   Tips.mutate(
    //     {
    //       misSysConfigKey: 'showRecordId',
    //     },
    //     {
    //       onSuccess: ({ data: loginData }) => {
           
    //         console.log("=======loginData======="+loginData);
    //         openDialog('tipsDialog', {
    //           title: 'Info Tips',
    //           message: `Please change the login regularly and keep the password properly to avoid leakage and cause security accidents!`,
    //           confirmAction: () => {}
    //         });

    //       },
          
    //     }
    );
  };

  const showToast = (message: string, onConfirm: () => void, onCancel: () => void) => {
    toast(<ConfirmationToast message={message} onConfirm={onConfirm} onCancel={onCancel} />, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  const handleConfirm = () => {
    console.log('确认按钮被点击');
    history.push('/changePassword');
  };

  const handleCancel = () => {
    console.log('取消按钮被点击');
  };

  useEffect(() => {
    if (properties.token) {
      userContext.mutate();
    }
  }, [properties.token]);

  // const { data: welcomeData} = useQuery(['useradmin'], async () => {
  //   //const { data: response } = await client.welcomePage.getWelcome();
  //   return 'response';
  // });
  // const welcomeData = useMutation(
  //   async () => {
  //     const { data: response } = await client.welcomePage.getWelcome();
  //     return response;
  //   })

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit(submitHandling)}>
        <div style={{ marginBottom: '40px', fontSize: 20, textAlign: 'center' }}>Login</div>
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
          onClick={() => {
            history.push('/forgot');
          }}
        >
          Forgot Password?
        </Button>
        {/* <Link to="/forgot" style={{ marginTop: '20px' }}>
          Forgot Password?
        </Link> */}
      </form>
    </div>
    
  );
};
export default LoginPage;
