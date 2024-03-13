import styles from './my-profile.module.scss';
import {
  Button,
  Card,
  Checkbox, // Dialog,
  // DialogActions,
  // DialogContent,
  // DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import cn from 'clsx';
import { UserDetail } from 'libs/common/src/lib/api';
import { useApi } from 'libs/common/src/lib/hooks';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// import { AiOutlineDelete } from 'react-icons/ai';
// import { BiShow } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyProfilePage = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { userId } = useParams<{ userId: string }>();

  const titleRef = useRef<HTMLDivElement>(null);
  const [currentWidth, setCurrentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef?.current?.offsetWidth) {
      setCurrentWidth(containerRef?.current?.offsetWidth);
    }
  }, [containerRef?.current?.offsetWidth]);

  useEffect(() => {
    queryClient.getQueryData('group');

    console.log('groupData=======', groupData);
    queryClient.getQueryData('myProfile');

    console.log('userData=======', userData);
  }, []);

  const { data: groupData } = useQuery(
    'group',
    async () => {
      const { data } = await client.userService.getGroupsByUserId({ id: userId });
      return data;
    },
    {
      initialData: queryClient.getQueryData('group'),
    }
  );

  const { data: userData } = useQuery(
    'myProfile',
    async () => {
      const { data: response } = await client.userService.getMyProfileByUserId({
        id: userId,
      });
      return response;
    },
    {
      initialData: queryClient.getQueryData('myProfile'),
      onSuccess: (data) => {
        console.log('userData data=======', data);
        reset({
          ...data,
        });
      },
    }
  );

  const { data: dictionary } = useQuery(
    'Type Dic',
    async () => {
      const { data } = await client.dictionary.getDicByDicId({ id: '0049000000000042' });
      return data;
    },
    {
      // initialData: queryClient.getQueryData('Type Dic'),
      enabled: true,
      onSuccess: (data) => {
        console.log('getPasswordPolicy data========', data);
      },
    }
  );

  const SaveUser = useMutation(client.userAdmin.saveUser, {
    onSuccess: () => {
      // reset({
      //   misEmail: '',
      //   misUserLoginId: '',
      //   misUserLocation: '',
      //   misUserName: '',
      //   misUserPassword: '',
      //   misUserId: '',
      // });
      toast('Save successfully', {
        type: 'success',
      });
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserDetail>({ mode: 'onSubmit' });

  return (
    <>
      <Paper
        sx={{
          height: '100%',
          backgroundColor: 'white',
          padding: '10px',
          overflowY: 'auto',
          borderRadius: '12px',
        }}
      >
        <Typography variant="h5">My profile</Typography>
        <Card
          // style={{ ...style, overflowY: 'auto' }}
          sx={{ marginBottom: '10px' }}
          className={cn(undefined, styles.container)}
        >
          <div ref={titleRef} className={styles.searchtitle}>
            {'Personal Information'}
          </div>
          <Paper
            ref={containerRef}
            className={styles.wrapper}
            sx={{
              height: `calc(100%)`,
            }}
          >
            <form
              onSubmit={handleSubmit(
                (data) => {
                  SaveUser.mutate({ ...data });
                },
                (error) => {
                  console.log(error);
                }
              )}
            >
              <div className={styles.searchform}>
                <Stack
                  spacing={{ xs: 1, sm: 2 }}
                  direction="row"
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="flex-start"
                >
                  <Controller
                    name="surnameEng"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.surnameEng}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Surname(Eng)"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.surnameEng?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="givenNameEng"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.givenNameEng}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Given Name(Eng)"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.givenNameEng?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="otherNameEng"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.otherNameEng}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Other Name(Eng)"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.otherNameEng?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="misUserName"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.misUserName}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="User Name(Chin)"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.misUserName?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="district"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl
                        fullWidth
                        variant="standard"
                        sx={{ width: '260px', marginTop: '18px', marginLeft: 8, marginRight: 8 }}
                      >
                        <InputLabel error={!!errors.district}>District</InputLabel>
                        <Select
                          autoWidth
                          error={!!errors.district}
                          variant="standard"
                          value={value}
                          label="District"
                          onChange={onChange}
                        >
                          {Array.isArray(dictionary) &&
                            dictionary.map((item) => (
                              <MenuItem key={item.key} value={item.key}>
                                {item.value}
                              </MenuItem>
                            ))}
                        </Select>
                        {!!errors.district && (
                          <FormHelperText error>
                            {errors?.district.message as string}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="tel"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.misUserName}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Tel."
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.misUserName?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="fax"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.misUserName}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Fax"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.misUserName?.message as string}
                      />
                    )}
                  />

                  <Controller
                    name="misEmail"
                    control={control}
                    rules={{
                      required: 'This Field is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Entered value does not match email format',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        InputLabelProps={{ shrink: !!value }}
                        error={!!errors.misEmail}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Email"
                        sx={{ width: '260px', marginTop: 2, marginLeft: 8, marginRight: 8 }}
                        helperText={errors.misEmail?.message as string}
                      />
                    )}
                  />
                  <Controller
                    name="isAdmin"
                    defaultValue={'N'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControl
                        error={!!errors?.isAdmin}
                        variant="standard"
                        sx={{
                          minWidth: '260px',
                          display: 'none',
                          flexDirection: 'column',
                          marginY: 2,
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      >
                        <Typography variant="caption">Administrator</Typography>
                        <FormControlLabel
                          checked={value === 'Y'}
                          onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                          control={<Checkbox />}
                          label={value === 'Y' ? 'Yes' : 'No'}
                          labelPlacement="end"
                          sx={{ marginY: -1 }}
                        />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="isLocked"
                    defaultValue={'N'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControl
                        error={!!errors?.isLocked}
                        variant="standard"
                        sx={{
                          minWidth: '260px',
                          display: 'none',
                          flexDirection: 'column',
                          marginY: 2,
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      >
                        <Typography variant="caption">Locked</Typography>
                        <FormControlLabel
                          checked={value === 'Y'}
                          onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                          control={<Checkbox />}
                          label={value === 'Y' ? 'Lock' : 'Unlock'}
                          labelPlacement="end"
                          sx={{ marginY: -1 }}
                        />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="misUserStatus"
                    defaultValue={'N'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControl
                        error={!!errors?.misUserStatus}
                        variant="standard"
                        sx={{
                          minWidth: '260px',
                          display: 'none',
                          flexDirection: 'column',
                          marginY: 2,
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      >
                        <Typography variant="caption">Status</Typography>
                        <FormControlLabel
                          checked={value === 'Y'}
                          onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                          control={<Checkbox />}
                          label={value === 'Y' ? 'Active' : 'Inactive'}
                          labelPlacement="end"
                          sx={{ marginY: -1 }}
                        />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="currentGroup"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'This Field is required',
                    }}
                    render={({ field: { value, onChange } }) => (
                      <FormControl
                        error={!!errors.currentGroup}
                        fullWidth
                        variant="standard"
                        sx={{ width: '260px', marginTop: '18px', marginLeft: 8, marginRight: 8,
                        display: 'none', }}
                      >
                        <InputLabel id="demo-simple-select-label">Current Group</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={value}
                          label="repeat"
                          onChange={onChange}
                        >
                          {groupData?.map((item) => (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!errors.currentGroup && (
                          <FormHelperText>{errors.currentGroup.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Stack>
                <Stack
                  spacing={1}
                  direction="row"
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="flex-start"
                >
                  <Button variant="contained" sx={{ my: 1 }} type="submit">
                    Save
                  </Button>
                </Stack>
              </div>
            </form>
          </Paper>
        </Card>
      </Paper>
      {/* <Typography variant="h5">My Profile</Typography>
      <form
        className={styles.form}
        onSubmit={handleSubmit((data) => {
          SaveUser.mutate({ ...data });
        })}
      >
        <Controller
          name="misUserLoginId"
          defaultValue={''}
          control={control}
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.misUserLoginId}
              onChange={onChange}
              value={value}
              fullWidth
              label="User Login ID"
              sx={{ maxWidth: '300px', marginTop: 2 }}
              helperText={errors.misUserLoginId?.message as string}
            />
          )}
        />
        <Controller
          name="misUserName"
          defaultValue={''}
          control={control}
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.misUserName}
              onChange={onChange}
              value={value}
              fullWidth
              label="User Name"
              sx={{ maxWidth: '300px', marginTop: 2 }}
              helperText={errors.misUserName?.message as string}
            />
          )}
        />

        <Controller
          name="misEmail"
          defaultValue={''}
          control={control}
          rules={{
            required: 'This Field is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Entered value does not match email format',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.misEmail}
              onChange={onChange}
              value={value}
              fullWidth
              label="Email Address"
              sx={{ maxWidth: '300px', marginTop: 2 }}
              helperText={errors.misEmail?.message as string}
            />
          )}
        />
        <Controller
          name="misUserLocation"
          control={control}
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.misUserLocation}
              onChange={onChange}
              value={value}
              fullWidth
              label="Location"
              sx={{ minWidth: '300px', marginTop: 2 }}
              helperText={errors.misUserLocation?.message as string}
            />
          )}
        /> 
        <Controller
          name="misUserPassword"
          defaultValue={''}
          control={control}
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              error={!!errors.misUserPassword}
              onChange={onChange}
              value={value}
              fullWidth
              label="Password"
              sx={{ maxWidth: '300px', marginTop: 2 }}
              helperText={errors.misUserPassword?.message as string}
            />
          )}
        />
        <Controller
          name="currentGroup"
          control={control}
          defaultValue=""
          rules={{
            required: 'This Field is required',
          }}
          render={({ field: { value, onChange } }) => (
            <FormControl
              error={!!errors.currentGroup}
              variant="standard"
              sx={{ maxWidth: '300px', marginTop: 2, marginBottom: 4 }}
            >
              <InputLabel id="demo-simple-select-label">Current Group</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value}
                label="repeat"
                onChange={onChange}
              >
                {groupData?.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.value}
                  </MenuItem>
                ))}
              </Select>
              {!!errors.currentGroup && (
                <FormHelperText>{errors.currentGroup.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Button
          sx={{ maxWidth: '300px', marginTop: 2, marginBottom: 4 }}
          variant="contained"
          type="submit"
        >
          save
        </Button>
      </form> */}
    </>
  );
};

export default MyProfilePage;
