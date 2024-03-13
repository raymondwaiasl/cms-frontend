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
import { faIR } from '@mui/x-data-grid';
import { UserContext } from 'libs/common/src/lib/context';
import { useApi, useLocalStorage, useSessionStorage, useWidget } from 'libs/common/src/lib/hooks';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye as Visibility, AiFillEyeInvisible as VisibilityOff } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const { resetStore } = useWidget();
  const queryClient = useQueryClient();
  const client = useApi();
  const { properties, setProperties } = useContext(UserContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const [digit, setDigit] = useState<boolean>(false);
  const [letters, setLetters] = useState<boolean>(false);
  const [upperLowerCase, setUpperLowerCase] = useState<boolean>(false);
  const [specialChar, setSpecialChar] = useState<boolean>(false);
  const [passwordLength, setPasswordLength] = useState<number>(8);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleToggleComfirmPassword = () => {
    setShowPassword1(!showPassword1);
  };

  useQuery(
    'getPasswordPolicy',
    async () => {
      const { data } = await client.loginService.getPasswordPolicy();
      return data;
    },
    {
      enabled: true,
      onSuccess: (data) => {
        console.log('getPasswordPolicy data========', data);
        setDigit((data.hasDigit as unknown as string) === 'true' ?? false);
        setLetters((data.hasLetters as unknown as string) === 'true' ?? false);
        setUpperLowerCase((data.hasUpperLowerCase as unknown as string) === 'true' ?? false);
        setSpecialChar((data.hasSpecialChar as unknown as string) === 'true' ?? false);
        setPasswordLength((data.passwordLength as unknown as number) ?? 8);
      },
    }
  );

  const changePwd = useMutation(client.userAdmin.changePassword);

  const handleLogout = () => {
    console.log('handling logout');
    setProperties({ ...properties, token: '' });
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('userName');
    queryClient.clear();
    resetStore();
  };

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onSubmit' });
  const history = useHistory();
  const submitHandling = async (formData: any) => {
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError(true);
    } else {
      // 处理重置密码逻辑
      console.log('Password reset:', password);
      console.log('Confirm password reset:', confirmPassword);
      console.log('formdata:', formData.misEmail);

      changePwd.mutate(
        {
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          onSuccess: ({ data: loginData }) => {
            console.log('loginData===================', loginData);
            toast('Update Successfully,Log out in 5 seconds...', {
              type: 'success',
            });
            setTimeout(() => {
              handleLogout();
            }, 5000);
          },
          onError: (error: any) => {
            console.log(error);
            toast(error.data, {
              type: 'warning',
            });
          },
        }
      );
    }
  };

  const isPasswordValid = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const digitConfig = digit === true ? hasDigit : true;
    const lettersConfig = letters === true ? hasUpperCase || hasLowerCase : true;
    const upperLowerCaseConfig = upperLowerCase === true ? hasUpperCase && hasLowerCase : true;
    const specialCharConfig = specialChar === true ? hasSpecialChar : true;
    const lengthConfig = password.length >= passwordLength;
    return (
      digitConfig && lettersConfig && upperLowerCaseConfig && specialCharConfig && lengthConfig
    );
  };
  const isMatchValid = (password: string) => {
    let newPwd = getValues('newPassword');
    if (newPwd === password) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className={styles.div}>
      <form className={styles.cpform} onSubmit={handleSubmit(submitHandling)}>
        <Typography sx={{ marginBottom: '20px' }} variant="h5">
          Change Password
        </Typography>
        {/* <div style={{ marginBottom: '20px', fontSize: 20 }}>Change Password</div> */}
        <Typography variant="body2">Please input your old password</Typography>

        <Controller
          name="oldPassword"
          control={control}
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.oldPassword}
              onChange={(e) => {
                onChange(e);
              }}
              value={value}
              type="password"
              fullWidth
              label="Old password"
              sx={{ minWidth: '300px', marginTop: 2, marginBottom: 2 }}
              helperText={errors.oldPassword?.message as string}
            />
          )}
        />

        <Typography variant="body2">Please input your new password</Typography>
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: 'This Field is required',
            validate: {
              isPasswordValid: (value) =>
                isPasswordValid(value) ||
                (('Password must contain at least ' + passwordLength) as string) +
                  ' characters' +
                  (digit || letters || upperLowerCase || specialChar ? ', including ' : '') +
                  (digit ? 'digit ' : '') +
                  ((digit && letters) || (digit && upperLowerCase) || (digit && specialChar)
                    ? ','
                    : '') +
                  (letters ? 'letters ' : '') +
                  ((letters && upperLowerCase) || (letters && specialChar) ? ',' : '') +
                  (upperLowerCase ? 'uppercase, lowercase ' : '') +
                  (specialChar && upperLowerCase ? ',' : '') +
                  (specialChar ? 'special character' : ''),
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.newPassword}
              onChange={(e) => {
                onChange(e);
                setPasswordError(true);
              }}
              value={value}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              label="New password"
              sx={{ minWidth: '300px', marginTop: 2 }}
              helperText={errors.newPassword?.message as string}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: 'This Field is required',
            validate: {
              isMatchValid: (value) => isMatchValid(value) || 'Passwords do not match',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.confirmPassword}
              onChange={(e) => {
                onChange(e);
                setPasswordError(false);
              }}
              value={value}
              type={showPassword1 ? 'text' : 'password'}
              fullWidth
              label="Confirm password"
              sx={{ minWidth: '300px', marginTop: 2, marginBottom: 2 }}
              helperText={errors.confirmPassword?.message as string}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleComfirmPassword}>
                      {showPassword1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
export default ChangePassword;
