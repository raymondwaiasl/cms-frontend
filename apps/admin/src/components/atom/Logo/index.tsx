// project import
import Logo from './Logo';
// material-ui
import { ButtonBase } from '@mui/material';
import { Link } from 'react-router-dom';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = (sx: any) => (
  <ButtonBase disableRipple component={Link} to="/" sx={sx}>
    <Logo />
  </ButtonBase>
);

export default LogoSection;
