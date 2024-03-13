import { queryFolderPermission, QueryGroupData, SavePermissionDataInput } from '../..//api';
import { useDialog } from '../../hooks';
import btnStyle from '../../style/btnStyle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { filePermission, levelIcon } from 'libs/common/src/lib/constant';
import { FC, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const roleType = [
  { label: 'Group', value: '3' },
  { label: 'User', value: '4' },
];

const DeleteDialog: FC<DeleteDialogProps> = ({
  isOpen,
  title,
  message,
  onCloseAction,
  onConfirmAction,
}) => {
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    title: string;
    groupList: QueryGroupData[];
    userList: QueryGroupData[];
    data?: queryFolderPermission;
    onConfirmAction: (data: Omit<SavePermissionDataInput, 'folderId'>) => void;
  }>('permissionDialog');
  console.log(data?.groupList);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    resetField,
    formState: { errors },
  } = useForm<Omit<SavePermissionDataInput, 'folderId'>>({
    defaultValues: {
      folderPer: data?.data?.misPermissionType || '1',
      permission: data?.data,
    },
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'permission.details', // unique name for your Field Array
  });
  const revisedGroupList = useMemo(() => data?.groupList.map((item) => item.id), [data?.groupList]);
  const revisedUserList = useMemo(() => data?.userList.map((item) => item.id), [data?.userList]);

  const onSubmit = (formData: Omit<SavePermissionDataInput, 'folderId'>) => {
    console.log(data);
    onConfirmAction && onConfirmAction(formData);
    data?.onConfirmAction && data.onConfirmAction(formData);
    closeCurrentDialog();
  };
  return (
    <Dialog
      open={isOpen || isDialogOpen}
      onClose={() => closeCurrentDialog()}
      fullWidth
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
          {title ?? data?.title}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <SimpleBar style={{ maxHeight: 300 }}>
        <DialogContent sx={{ minWidth: '400px' }}>
          <form
            id="permissionForm"
            onSubmit={handleSubmit(onSubmit, (error) => {
              console.log(error);
            })}
          >
            <Controller
              name="folderPer"
              control={control}
              defaultValue="1"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl component="fieldset" error={!!error}>
                  <FormLabel component="legend">Folder Permission</FormLabel>
                  <FormControlLabel
                    checked={value === '2'}
                    defaultChecked={value === '2'}
                    control={
                      <Switch
                        color="primary"
                        onChange={() => onChange(value === '2' ? '1' : '2')}
                      />
                    }
                    label={value === '2' ? 'This folder and child folder' : 'This Folder only'}
                    labelPlacement="end"
                  />
                  {!!error && <FormHelperText>{error?.message}</FormHelperText>}
                </FormControl>
              )}
            />

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
                  name={`permission.details.${index}.misPdType`}
                  control={control}
                  rules={{
                    required: 'This Field is required',
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    console.log(error);
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
                            resetField(`permission.details.${index}.misPdPerformerId`);
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
                  name={`permission.details.${index}.misPdPerformerId`}
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
                        (watch(`permission.details.${index}.misPdType`) === '3'
                          ? revisedGroupList
                          : revisedUserList) ?? []
                      }
                      sx={{ marginRight: 2 }}
                      getOptionLabel={(option) => {
                        console.log(option);
                        return (
                          (watch(`permission.details.${index}.misPdType`) === '3'
                            ? data?.groupList.find((item) => item.id === option)?.name
                            : data?.userList.find((item) => item.id === option)?.name) ?? ''
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
                  name={`permission.details.${index}.misPdRight`}
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
                      <InputLabel id="demo-simple-select-label">Right</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        label="Age"
                        onChange={onChange}
                      >
                        {Object.entries(filePermission).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
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
                  misPdId: '',
                  misPermissionId: data?.data?.misPermissionId ?? '',
                  misPdType: '4',
                  misPdPerformerId: '',
                  misPdRight: '0',
                });
              }}
            >
              Add Permisssion
            </Button>
          </form>
        </DialogContent>
      </SimpleBar>

      <DialogActions>
        <Button {...btnStyle.primary} type="submit" form="permissionForm">
          Confirm
        </Button>
        <Button
          {...btnStyle}
          onClick={() => {
            reset();
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

export default DeleteDialog;

export type DeleteDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirmAction?: (data: Omit<SavePermissionDataInput, 'folderId'>) => void;
  onCloseAction?: () => void;
};
