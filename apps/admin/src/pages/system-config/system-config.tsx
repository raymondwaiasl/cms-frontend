import OrgConfig from './org-config';
import {
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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { AddSysConfigInput } from 'libs/common/src/lib/api';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const SystemConfig = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openDialog } = useDialog();
  const [configType, setConfigType] = useState(0);
  const [previewImage, setPreviewImage] = useState('');
  const configColumns: GridColDef[] = [
    {
      field: 'misSysConfigKey',
      headerName: 'Config Key',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'misSysConfigValue',
      headerName: 'Config Value',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'Action',
      headerName: 'Action',
      minWidth: 200,
      type: 'actions',
      headerAlign: 'left',
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() => {
                setIsDialogOpen(true);
                reset({
                  ...props.row,
                });
                setConfigType(props.row.misSysConfigType);
                if (props.row.misSysConfigType == 1) {
                  setPreviewImage(
                    process.env['NX_API_URL'] + 'files/sysconfig/' + props.row.misSysConfigValue
                  );
                }
              }}
              color="primary"
            >
              Edit
            </Button>{' '}
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete System Config ',
                  message: `Are you sure to delete ${props.row.misSysConfigkey}`,
                  confirmAction: () =>
                    delSystemConfig.mutate({
                      misSysConfigId: props.id as string,
                    }),
                });
              }}
            >
              DELETE
            </Button>
          </>
        );
      },
    },
  ];

  const { data: systemConfigs, isLoading } = useQuery(
    'system config',
    async () => {
      const { data: response } = await client.sysConfig.getSysConfigList();
      return response;
    },
    {
      placeholderData: [],
    }
  );

  console.log(systemConfigs);

  const saveSystemConfig = useMutation(client.sysConfig.addSystemConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries('system config');
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  const delSystemConfig = useMutation(client.sysConfig.deleteSystemConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries('system config');
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AddSysConfigInput>({ mode: 'onSubmit' });

  const isEdit = watch('misSysConfigId');

  return (
    <Stack spacing={2}>
      <OrgConfig />
      <Card sx={{ minWidth: 275, maxWidth: 700 }}>
        <CardContent>
          <Typography variant="h5">System Configuration</Typography>
          <Button
            variant="contained"
            sx={{ my: 1 }}
            onClick={() => {
              setIsDialogOpen(true);
              reset({
                misSysConfigId: '',
                misSysConfigKey: '',
                misSysConfigValue: '',
                misSysConfigType: 0,
              });
              setConfigType(0);
              setPreviewImage('');
            }}
          >
            Create New
          </Button>
          <DataGrid
            autoHeight
            rows={systemConfigs}
            loading={isLoading}
            rowsPerPageOptions={[10, 30, 50, 70, 100]}
            pagination={true}
            columns={configColumns}
            disableColumnMenu
            getRowId={(row) => row.misSysConfigId}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen}>
        <form
          onSubmit={handleSubmit(
            (data) => {
              // console.log(data);
              // let formData = new FormData();
              // if(data.misSysConfigImage){
              //   formData.append("file", data.misSysConfigImage);
              // }

              saveSystemConfig.mutate({ ...data });
            },
            (error) => {
              console.log(error);
            }
          )}
        >
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} Configuration</DialogTitle>
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
              name="misSysConfigKey"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.misSysConfigKey}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Config Key"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.misSysConfigKey?.message as string}
                />
              )}
            />
            <Controller
              name="misSysConfigValue"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  {configType == 0 && (
                    <TextField
                      error={!!errors.misSysConfigValue}
                      onChange={onChange}
                      value={value}
                      fullWidth
                      label="Config Value"
                      sx={{ minWidth: '300px', marginTop: 2 }}
                      helperText={errors.misSysConfigValue?.message as string}
                    />
                  )}
                </>
              )}
            />
            <Controller
              name="misSysConfigImage"
              control={control}
              rules={
                {
                  // required: 'This Field is required',
                }
              }
              render={({ field: { onChange, value } }) => (
                <>
                  {configType == 1 && (
                    <label htmlFor="btn-upload" style={{ marginTop: '20px', width: '100%' }}>
                      <input
                        id="btn-upload"
                        name="btn-upload"
                        style={{ display: 'none' }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e?.target?.files && e.target.files.length > 0) {
                            setPreviewImage(URL.createObjectURL(e.target.files[0]));
                            onChange(e);
                            setValue('misSysConfigImage', e.target.files[0]);
                            setValue('misSysConfigValue', e.target.files[0].name);
                          }
                        }}
                      />
                      <Button
                        className="btn-choose"
                        variant="outlined"
                        component="span"
                        sx={{ minWidth: '300px', width: '100%' }}
                      >
                        Choose Image
                      </Button>
                    </label>
                  )}
                </>
              )}
            />
            {configType == 1 && previewImage && (
              <div style={{ marginTop: '20px' }}>
                <img className="preview my20" src={previewImage} alt="" />
              </div>
            )}
            <Controller
              name="misSysConfigVisible"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  variant="standard"
                  sx={{ m: 1, minWidth: 200 }}
                  error={!!errors.misSysConfigVisible}
                >
                  <InputLabel id="demo-simple-select-standard-label">Visiable</InputLabel>
                  <Select
                    displayEmpty
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    onChange={onChange}
                  >
                    <MenuItem key={'yes'} value={0}>
                      Yes
                    </MenuItem>
                    <MenuItem key={'No'} value={1}>
                      No
                    </MenuItem>
                  </Select>
                  <FormHelperText>{errors?.misSysConfigVisible?.message as string}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="misSysConfigType"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  variant="standard"
                  sx={{ m: 1, minWidth: 200 }}
                  error={!!errors.misSysConfigType}
                >
                  <InputLabel id="demo-simple-select-standard-label">Type</InputLabel>
                  <Select
                    displayEmpty
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    onChange={(e) => {
                      setConfigType(Number(e.target.value));
                      onChange(e);
                    }}
                    // defaultValue={0}
                  >
                    <MenuItem key={'Text'} value={0}>
                      Text
                    </MenuItem>
                    <MenuItem key={'Image'} value={1}>
                      Image
                    </MenuItem>
                  </Select>
                  <FormHelperText>{errors?.misSysConfigType?.message as string}</FormHelperText>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              {isEdit ? 'Edit' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default SystemConfig;
