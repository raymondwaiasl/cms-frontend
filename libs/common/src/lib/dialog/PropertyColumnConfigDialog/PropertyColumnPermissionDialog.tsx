import { SavePropertyColumnPermissionInput } from '../../api/propertyColumnPermission';
import { ColumnConfigConditionArr, levelIcon } from '../../constant';
import { useDialog, useApi } from '../../hooks';
import btnStyle from '../../style/btnStyle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { Controller, useForm, useWatch, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const PropertyColumnPermissionDialog: FC<PropertyColumnPermissionDialogProps> = ({
  isOpen,
  onCloseAction,
  onConfirmAction,
}) => {
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    columnConfigId: string;
    onConfirmAction: (data: SavePropertyColumnPermissionInput) => void;
  }>('propertyColumnPermissionDialog');
  const queryClient = useQueryClient();
  const client = useApi();

  const roleType = [
    { label: 'Group', value: '3' },
    { label: 'User', value: '4' },
  ];
  const {
    control,
    handleSubmit,
    reset,
    watch,
    resetField,
    formState: { errors },
  } = useForm<SavePropertyColumnPermissionInput>({
    defaultValues: {
      // folderPer: data?.data?.misPermissionType || '1',
      // permission: data?.data,
      // columnPermission: columnPermissionConfigData??[],
    },
  });
  const { data: groupData } = useQuery(
    'group',
    async () => {
      const { data } = await client.userService.queryGroupData({ id: '3' });
      return data;
    },
    {
      initialData: queryClient.getQueryData('group'),
    }
  );

  const { data: userData } = useQuery(
    'user',
    async () => {
      const { data } = await client.userService.queryGroupData({ id: '4' });
      return data;
    },
    {
      initialData: queryClient.getQueryData('user'),
    }
  );

  const columnConfigId = data?.columnConfigId ?? '';

  const { data: columnPermissionConfigData, isLoading } = useQuery(
    ['columnConfigPermission', columnConfigId],
    async () => {
      const { data } = await client.property.getPropertyColumnPermission({
        misPropertyConfigDetailColumnId: columnConfigId,
      });
      return data;
    },
    {
      enabled: !!columnConfigId,
      onSuccess: (data) => {
        reset({ misPropertyConfigDetailColumnId: columnConfigId, columnPermission: data });
      },
      //initialData: queryClient.getQueryData('user'),
    }
  );

  console.log('columnPermissionConfigData', columnPermissionConfigData);

  const revisedGroupList = useMemo(() => groupData?.map((item) => item.id), [groupData]);
  const revisedUserList = useMemo(() => userData?.map((item) => item.id), [userData]);

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'columnPermission', // unique name for your Field Array
  });

  const onSubmit = (formData: SavePropertyColumnPermissionInput) => {
    onConfirmAction && onConfirmAction(formData);
    data?.onConfirmAction && data.onConfirmAction(formData);
    closeCurrentDialog();
  };

  return (
    <Dialog
      open={isOpen || isDialogOpen}
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
          {'Property Column Permission'}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <SimpleBar style={{ maxHeight: 300 }}>
        <DialogContent sx={{ minWidth: '400px' }}>
          <form
            id="columnPermissionForm"
            onSubmit={handleSubmit(onSubmit, (error) => {
              console.log(error);
            })}
          >
            {fields.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  marginY: 3,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Controller
                  name={`columnPermission.${index}.misPdType`}
                  control={control}
                  rules={{
                    required: 'This Field is required',
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <FormControl
                        variant="standard"
                        sx={{ marginRight: 2 }}
                        fullWidth
                        error={!!error}
                      >
                        <InputLabel id="demo-simple-select-label">Type</InputLabel>
                        <Select
                          value={value}
                          label="Age"
                          onChange={(e) => {
                            onChange(e);
                            resetField(`columnPermission.${index}.misPdPerformerId`);
                          }}
                        >
                          {roleType.map((item) => (
                            <MenuItem key={item.label} value={item.value}>
                              <Box
                                component={levelIcon[item.value]}
                                color="inherit"
                                sx={{ mx: 1 }}
                              />
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!error?.message && <FormHelperText>{error?.message}</FormHelperText>}
                      </FormControl>
                    );
                  }}
                />
                <Controller
                  name={`columnPermission.${index}.misPdPerformerId`}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'This Field is required',
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Autocomplete
                      fullWidth
                      disableClearable
                      id="combo-box-demo"
                      options={
                        (watch(`columnPermission.${index}.misPdType`) === '3'
                          ? revisedGroupList
                          : revisedUserList) ?? []
                      }
                      sx={{ marginRight: 2 }}
                      getOptionLabel={(option) => {
                        return (
                          (watch(`columnPermission.${index}.misPdType`) === '3'
                            ? groupData?.find((item) => item.id === option)?.name
                            : userData?.find((item) => item.id === option)?.name) ?? ''
                        );
                      }}
                      value={value}
                      onChange={(evt, value) => onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          variant="standard"
                          {...params}
                          label="Name"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name={`columnPermission.${index}.misPdAction`}
                  control={control}
                  rules={{
                    required: 'This Field is required',
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl
                      variant="standard"
                      fullWidth
                      sx={{ marginRight: 2 }}
                      error={!!error}
                    >
                      <InputLabel id="demo-simple-select-label">Action</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        label="Age"
                        onChange={onChange}
                      >
                        <MenuItem key={'I'} value={'I'}>
                          Invisible
                        </MenuItem>
                        <MenuItem key={'D'} value={'D'}>
                          Disabled
                        </MenuItem>
                      </Select>
                      {!!error?.message && <FormHelperText>{error?.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
                <Button
                  color="error"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Delete
                </Button>
              </Box>
            ))}

            <Button
              {...btnStyle}
              onClick={() => {
                append({
                  misPropertyColumnPermissionId: '',
                  misPropertyConfigDetailColumnId: data?.columnConfigId ?? '',
                  misPdType: '4',
                  misPdPerformerId: '',
                  misPdAction: '1',
                });
              }}
            >
              Add Permisssion
            </Button>
          </form>
        </DialogContent>
      </SimpleBar>
      <DialogActions>
        <Button variant="contained" type="submit" form="columnPermissionForm">
          Confirm
        </Button>
        <Button
          onClick={() => {
            closeCurrentDialog();
            onCloseAction && onCloseAction();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyColumnPermissionDialog;

export type PropertyColumnPermissionDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onCloseAction?: () => void;
  onConfirmAction?: (data: SavePropertyColumnPermissionInput) => void;
};
