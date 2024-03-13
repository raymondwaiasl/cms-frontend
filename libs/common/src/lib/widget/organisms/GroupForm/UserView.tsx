import { Avatar, BoxProps, Grid, TextField } from '@mui/material';
import { FC } from 'react';

function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

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

const UserView: FC<UserViewProps> = ({ username = '', loginId, location, email }) => {
  console.log(username);

  return (
    <>
      <Avatar alt="Remy Sharp" {...stringAvatar(username)} style={{ marginBottom: '16px' }} />
      <Grid container spacing={1}>
        <Grid item>
          <TextField
            multiline
            label="User Login ID"
            defaultValue="LOGIN ID"
            variant="filled"
            value={loginId}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item>
          <TextField
            multiline
            label="User Name"
            defaultValue="Username"
            variant="filled"
            value={username}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item>
          <TextField
            multiline
            label="User Location"
            defaultValue="Location"
            variant="filled"
            value={location}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item>
          <TextField
            multiline
            label="Email"
            defaultValue="Email"
            variant="filled"
            value={email}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export type UserViewProps = {
  username?: string;
  loginId?: string;
  location?: string;
  email?: string;
} & BoxProps;

export default UserView;
