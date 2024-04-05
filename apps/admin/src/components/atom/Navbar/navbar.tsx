import route from '../../../router/route';
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
} from '@mui/material';
import { UserContext } from 'libs/common/src/lib/context';
// import dataStore from 'libs/common/src/lib/store/dataStore';
import { useWidget } from 'libs/common/src/lib/hooks';
import { MouseEvent, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';

// import LogoSection from '../Logo';

const Navbar = () => {
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation();
  //const { resetStore } = useWidget();
  const { properties, setProperties } = useContext(UserContext);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const history = useHistory();
  const userId: string = sessionStorage.getItem('userId') as string;

  const handleLangChange = (evt: MouseEvent<HTMLElement>, newLang: LangType) => {
    // setProperties({ ...properties, currentLang: newLang });
    i18n.changeLanguage(newLang);
  };

  const toMyProfile = () => {
    console.log('to My Profile');
    console.log('userId=====', userId);
    history.push(route.myProfile + userId);
  };

  const handleLogout = () => {
    console.log('handling logout');
    setProperties({ ...properties, token: '' });
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    queryClient.clear();
    // resetStore();
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
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" noWrap component="div">
            ASL
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" {...stringAvatar('John Doe')} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
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

            <MenuItem onClick={toMyProfile}>
              <Typography textAlign="center">{t('myProfile')}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center">{t('logout')}</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

type LangType = 'EN' | 'TC' | 'SC';
