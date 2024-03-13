import styles from './login-page.module.scss';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material';
import { UserContext } from 'libs/common/src/lib/context';
import { useApi, useLocalStorage, useSessionStorage } from 'libs/common/src/lib/hooks';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye as Visibility, AiFillEyeInvisible as VisibilityOff } from 'react-icons/ai';
import { useMutation, useQueryClient } from 'react-query';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const queryClient = useQueryClient();
  const client = useApi();

  const forgotPwd = useMutation(client.loginService.forgotPwd);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: 'onBlur' });
  const history = useHistory();
  const submitHandling = async (formData: any) => {
    console.log('formdata:', formData.misEmail);
    forgotPwd.mutate(
      {
        email: formData.misEmail,
      },
      {
        onSuccess: ({ data: loginData }) => {
          console.log('loginData===================', loginData);
          toast('Submit Successfully', {
            type: 'success',
          });
          history.push('/login');
        },
        onError: (error: any) => {
          console.log(error);
          toast(error.data, {
            type: 'warning',
          });
        },
      }
    );
  };
  useEffect(() => {}, []);
  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit(submitHandling)}>
        <div style={{ marginBottom: '20px', fontSize: 20 }}>Forgot Password</div>
        {/*<Typography variant="body2">Please input your login name or email address</Typography>*/}
        <Typography variant="body2">Please input your login name</Typography>

        <Controller
          name="misEmail"
          control={control}
          rules={{
            required: 'This Field is required',
            // pattern: {
            //   value: /^$|^\S+@\S+\.\S+$/,
            //   message: 'Entered value does not match login name or email format',
            // },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              style={{ marginTop: '20px' }}
              error={!!errors.misEmail}
              onChange={onChange}
              value={value}
              fullWidth
              // label="Login Name or Email"
              label="Login Name"
              sx={{ minWidth: '300px', marginTop: 2, marginBottom: 2 }}
              helperText={errors.misEmail?.message as string}
            />
          )}
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};
export default ForgotPassword;
