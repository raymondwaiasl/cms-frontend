import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { ChangeAccountSettingInput, ChangePasswordInput } from 'libs/common/src/lib/api';
import { DataResponse } from 'libs/common/src/lib/api/common';
import { UserContext } from 'libs/common/src/lib/context';
// import dataStore from 'libs/common/src/lib/store/dataStore';
import { useWidget } from 'libs/common/src/lib/hooks';
import { useApi } from 'libs/common/src/lib/hooks';
import { MouseEvent, useContext, useState, forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useResetRecoilState } from 'recoil';

const Navbar = forwardRef<HTMLDivElement>((props, ref) => {
  const { resetStore } = useWidget();
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation();
  const { properties, setProperties } = useContext(UserContext);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const client = useApi();
  const [isAccountSettingDialogOpen, setIsAccountSettingDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userName, setUserName] = useState(
    sessionStorage.getItem('userName') ?? localStorage.getItem('userName') ?? 'Anonymous'
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const history = useHistory();
  const userId: string = sessionStorage.getItem('userId') as string;
  console.log(i18n);

  const { data: systemLogo } = useQuery(
    'sysconfig.system.logo',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'system.logo',
      });
      return response;
    },
    {
      initialData: queryClient.getQueryData('sysconfig.system.logo'),
      staleTime: Infinity,
    }
  );

  const { data: systemName } = useQuery(
    'sysconfig.system.name',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'system.name',
      });
      return response;
    },
    {
      initialData: queryClient.getQueryData('sysconfig.system.name'),
      staleTime: Infinity,
    }
  );

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleLangChange = (evt: MouseEvent<HTMLElement>, newLang: LangType) => {
    // setProperties({ ...properties, currentLang: newLang });
    i18n.changeLanguage(newLang);
  };
  const toMyProfile = () => {
    console.log('to My Profile');
    console.log('userId=====', userId);
    history.push('/myProfile/' + userId);
  };
  const handleLogout = () => {
    console.log('handling logout');
    setProperties({ ...properties, token: '' });
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('userName');
    queryClient.clear();
    resetStore();
    history.push('/login');
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name
        .split(' ')
        .filter((item, index, arr) => index === 0 || index === arr.length - 1)
        .map((item) => item[0])
        .join('')}`,
    };
  }

  const {
    control: changeAccountSettingControl,
    handleSubmit: changeAccountSettingHandleSubmit,
    reset: changeAccountSettingReset,
    watch: changeAccountSettingWatch,
    setValue: changeAccountSettingSetValue,
    getValues: changeAccountSettingGetValues,
    formState: { errors: changeAccountSettingErrors },
  } = useForm<ChangeAccountSettingInput>({ mode: 'onSubmit' });

  const changeAccountSetting = useMutation(client.userAdmin.changeAccountSetting, {
    onSuccess: () => {
      setUserName(changeAccountSettingGetValues('userName'));
      toast('Update Successfully', {
        type: 'success',
      });
    },
    onSettled: () => {
      setIsAccountSettingDialogOpen(false);
    },
  });

  const {
    control: changePasswordControl,
    handleSubmit: changePasswordHandleSubmit,
    reset: changePasswordReset,
    watch: changePasswordWatch,
    setValue: changePasswordSetValue,
    getValues: changePasswordGetValues,
    setError: changePasswordSetError,
    clearErrors: changePasswordClearErrors,
    formState: { errors: changePasswordErrors },
  } = useForm<ChangePasswordInput>({ mode: 'onSubmit' });

  const changePassword = useMutation(client.userAdmin.changePassword, {
    onSuccess: () => {
      toast('Update Successfully,Log out in 5 seconds...', {
        type: 'success',
      });
      setIsChangePasswordOpen(false);

      setTimeout(() => {
        handleLogout();
      }, 5000);
    },
    onError: (result: DataResponse<any>) => {
      if (result.code == 1000000001) {
        changePasswordSetError('currentPassword', { type: 'custom', message: result.msg });
      }
    },
    // onSettled: () => {
    //   setIsChangePasswordOpen(false);
    // },
  });

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'white' }}
      ref={ref}
    >
      <Toolbar sx={{ justifyContent: 'left' }}>
        {systemLogo?.misSysConfigValue && (
          <>
            <Box
              component="img"
              sx={{
                objectFit: 'contain',
                height: 60,
                width: 300,
                maxHeight: { xs: 60, md: 60 },
                maxWidth: { xs: 350, md: 300 },
              }}
              alt="The house from the offer."
              src={process.env['NX_API_URL'] + '/files/sysconfig/' + systemLogo?.misSysConfigValue}
            />
            {/* <Typography variant="h6" noWrap component="div" sx={{ color: 'black' }}>
            <img src={process.env['NX_API_URL'] + 'files/sysconfig/' + systemLogo?.misSysConfigValue}/>
          </Typography> */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderRightWidth: '2px', borderColor: 'black', margin: '10px' }}
            />
          </>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ color: 'black', fontWeight: 'bolder' }}
        >
          {systemName?.misSysConfigValue}
        </Typography>
        <Box sx={{ flexGrow: 0, position: 'absolute', right: 0, paddingRight: '24px' }}>
          <Tooltip title="Open settings">
            {/* <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={userName} {...stringAvatar(userName)} />
              {userName}
            </IconButton> */}
            <Button
              startIcon={<Avatar alt={userName} {...stringAvatar(userName)} />}
              endIcon={Boolean(anchorElUser) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              variant="text"
              sx={{ p: 0, color: 'black', fontWeight: 'bolder' }}
              onClick={handleOpenUserMenu}
            >
              {userName}
            </Button>
          </Tooltip>
          <Menu
            sx={{
              mt: '45px',
              ['.MuiMenu-paper']: {
                padding: '0.5rem',
                borderRadius: '20px',
              },
            }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {/*<MenuItem>*/}
              {/*{t('lang')}*/}
              {/*<ToggleButtonGroup*/}
              {/*  color="primary"*/}
              {/*  defaultValue={i18n.language}*/}
              {/*  value={i18n.language}*/}
              {/*  onChange={handleLangChange}*/}
              {/*  exclusive*/}
              {/*  fullWidth*/}
              {/*  sx={{ ml: 1 }}*/}
              {/*  aria-label="Language"*/}
              {/*>*/}
              {/*  <ToggleButton value="zh-TW">繁</ToggleButton>*/}
              {/*  <ToggleButton value="zh-CN">簡</ToggleButton>*/}
              {/*  <ToggleButton value="EN">Eng</ToggleButton>*/}
              {/*</ToggleButtonGroup>*/}
            {/*</MenuItem>*/}
            {/*<Divider />*/}

            {/* <MenuItem
              onClick={async (e) => {
                const { data: response } = await client.userAdmin.getAccountSetting();
                changeAccountSettingReset({ ...response });
                setIsAccountSettingDialogOpen(true);
              }}
            >
              <Typography textAlign="center">{t('account_setting')}</Typography>
            </MenuItem> */}
            <MenuItem
              onClick={(e) => {
                history.push('/changePassword');
              }}
            >
              <Typography textAlign="center">{t('change_password')}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={toMyProfile}>
              <Typography textAlign="center">{t('myProfile')}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center" color="red">
                {t('logout')}
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Dialog
        open={isAccountSettingDialogOpen}
        PaperProps={{
          sx: {
            padding: '40px',
            borderRadius: '20px',
            minWidth: '680px',
            maxWidth: '800px',
            overflowX: 'auto',
          },
        }}
      >
        <form
          onSubmit={changeAccountSettingHandleSubmit(
            (data) => {
              changeAccountSetting.mutate({ ...data });
            },
            (error) => {
              console.log(error);
            }
          )}
          style={{
            padding: '40px',
            backgroundColor: 'white',
            height: '100%',
            borderRadius: '50px 0 0 50px',
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
              {'Account Setting'}
            </Typography>
            <IconButton onClick={() => setIsAccountSettingDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >
            <Controller
              name="loginName"
              control={changeAccountSettingControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!changeAccountSettingErrors.loginName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Login Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={changeAccountSettingErrors.loginName?.message as string}
                  disabled
                />
              )}
            />

            <Controller
              name="userName"
              control={changeAccountSettingControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!changeAccountSettingErrors.userName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="User Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={changeAccountSettingErrors.userName?.message as string}
                />
              )}
            />

            <Controller
              name="emailAddress"
              control={changeAccountSettingControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!changeAccountSettingErrors.emailAddress}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Email Address"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={changeAccountSettingErrors.emailAddress?.message as string}
                />
              )}
            />

            <Controller
              name="groupName"
              control={changeAccountSettingControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!changeAccountSettingErrors.groupName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Group Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={changeAccountSettingErrors.groupName?.message as string}
                  disabled
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              Save
            </Button>
            <Button
              onClick={() => {
                setIsAccountSettingDialogOpen(false);
                // reset();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={isChangePasswordOpen}
        PaperProps={{
          sx: {
            padding: '40px',
            borderRadius: '20px',
            minWidth: '680px',
            maxWidth: '800px',
            overflowX: 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
            {'Change Password'}
          </Typography>
          <IconButton onClick={() => setIsChangePasswordOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            paddingTop: 3,
          }}
        >
          <form
            id="changePasswordForm"
            onSubmit={changePasswordHandleSubmit(
              (data) => {
                let pass = true;
                let confirmPassword = changePasswordGetValues('confirmPassword');
                let newPassword = changePasswordGetValues('newPassword');
                if (confirmPassword !== newPassword) {
                  changePasswordSetError('confirmPassword', {
                    type: 'custom',
                    message: 'The new password and confirmed password are different!',
                  });
                  pass = false;
                  return;
                } else {
                  changePasswordClearErrors('confirmPassword');
                }
                if (pass) {
                  changePassword.mutate({ ...data });
                }
              },
              (error) => {
                console.log(error);
              }
            )}
          >
            <Controller
              name="currentPassword"
              control={changePasswordControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  sx={{ m: 0, width: '100%', marginTop: '16px' }}
                  variant="outlined"
                  error={!!changePasswordErrors.currentPassword}
                >
                  <InputLabel htmlFor="outlined-adornment-password">Current Password</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    onChange={onChange}
                    value={value}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={(e) => {
                            setShowCurrentPassword(!showCurrentPassword);
                          }}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Current Password"
                  />
                  <FormHelperText>
                    {changePasswordErrors.currentPassword?.message as string}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="newPassword"
              control={changePasswordControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  sx={{ m: 0, width: '100%', marginTop: '16px' }}
                  variant="outlined"
                  error={!!changePasswordErrors.newPassword}
                >
                  <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showNewPassword ? 'text' : 'password'}
                    onChange={onChange}
                    value={value}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={(e) => {
                            setShowNewPassword(!showNewPassword);
                          }}
                          // onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="New Password"
                  />
                  <FormHelperText>
                    {changePasswordErrors.newPassword?.message as string}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="confirmPassword"
              control={changePasswordControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  sx={{ m: 0, width: '100%', marginTop: '16px' }}
                  variant="outlined"
                  error={!!changePasswordErrors.confirmPassword}
                >
                  <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    onChange={onChange}
                    value={value}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={(e) => {
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirm Password"
                  />
                  <FormHelperText>
                    {changePasswordErrors.confirmPassword?.message as string}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" type="submit" form="changePasswordForm">
            Save
          </Button>
          <Button
            onClick={() => {
              setIsChangePasswordOpen(false);
              changePasswordReset();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
});

export default Navbar;

type LangType = 'EN' | 'TC' | 'SC';
