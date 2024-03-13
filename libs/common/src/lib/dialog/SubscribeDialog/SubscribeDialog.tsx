import { SaveSubscriptionInput } from '../../api';
import { useDialog } from '../../hooks';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

const repeatType = [
  { label: 'Never', value: 'N' },
  { label: 'Daily', value: 'D' },
  { label: 'Week', value: 'W' },
  { label: 'Monthly', value: 'M' },
  { label: 'Yearly', value: 'M' },
];

const SubscribeDialog: FC<DeleteDialogProps> = ({ isOpen, onCloseAction }) => {
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    onConfirmAction: (data: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => void;
  }>('subscribeDialog');
  const {
    control,
    handleSubmit,
    reset,
    setError,
    unregister,
    clearErrors,
    getValues,
    resetField,
    formState: { errors },
  } = useForm<{
    buDate: string;
    checkedB: boolean;
    checkedD: boolean;
    checkedM: boolean;
    checkedN: boolean;
    repeat: string;
    no_selection?: string;
    [key: string]: any;
  }>({
    defaultValues: {
      buDate: '',
      checkedB: false,
      checkedD: false,
      checkedM: false,
      checkedN: false,
      repeat: '',
    },
  });
  console.log(errors);
  const bringUp = useWatch({
    control,
    name: 'checkedB',
  });

  const onSubmit = (formData: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => {
    console.log(formData);
    data?.onConfirmAction &&
      data?.onConfirmAction(formData as Omit<SaveSubscriptionInput, 'id' | 'typeId'>);
    closeCurrentDialog();
  };
  return (
    <Dialog
      open={isOpen || isDialogOpen}
      onClose={() => closeCurrentDialog()}
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
          {'Subscription Config'}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minWidth: '400px' }}>
        <form id="subscribeForm" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', marginY: 1, flexDirection: 'column' }}>
            <Controller
              name="checkedN"
              defaultValue={false}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <FormControlLabel
                    label="New"
                    control={<Checkbox checked={value} onChange={onChange} />}
                  />
                  {errors?.checkedN && (
                    <FormHelperText error={!!errors?.checkedN}>
                      {errors?.checkedN.message}
                    </FormHelperText>
                  )}
                </>
              )}
            />
            <Controller
              name="checkedM"
              defaultValue={false}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <FormControlLabel
                    label="Modified"
                    control={<Checkbox checked={value} onChange={onChange} />}
                  />
                  {errors?.checkedM && (
                    <FormHelperText error={!!errors?.checkedM}>
                      {errors?.checkedM.message}
                    </FormHelperText>
                  )}
                </>
              )}
            />
            <Controller
              name="checkedD"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange } }) => (
                <>
                  <FormControlLabel
                    label="Deleted"
                    control={<Checkbox checked={value} onChange={onChange} />}
                  />
                  {errors?.checkedD && (
                    <FormHelperText error={!!errors?.checkedD}>
                      {errors?.checkedD.message}
                    </FormHelperText>
                  )}
                </>
              )}
            />
            <Controller
              name="checkedB"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange } }) => (
                <>
                  <FormControlLabel
                    label="Bring-up"
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => {
                          onChange(e);
                          resetField('buDate');
                          resetField('repeat');
                        }}
                      />
                    }
                  />
                  {errors?.checkedB && (
                    <FormHelperText error={!!errors?.checkedB}>
                      {errors?.checkedB.message}
                    </FormHelperText>
                  )}
                </>
              )}
            />
            {errors?.no_selection?.message && (
              <FormHelperText error>{errors?.no_selection?.message}</FormHelperText>
            )}
            {bringUp && (
              <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                <Controller
                  name="buDate"
                  defaultValue=""
                  rules={{
                    required: {
                      value: bringUp,
                      message: 'Bring up date cannot be empty',
                    },
                  }}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <DatePicker
                        label="Bring-up Date"
                        disablePast
                        inputFormat="dd/MM/yyyy"
                        value={value}
                        onChange={(newValue: DateTime | null | undefined) => {
                          console.log(newValue?.toJSON());
                          if (newValue) {
                            onChange(newValue.toJSON());
                          }
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              variant="standard"
                              inputRef={params.inputRef}
                              InputProps={params.InputProps}
                              inputProps={params.inputProps}
                              value={value}
                              onChange={onChange}
                              error={!!errors?.buDate?.type}
                              label="Bring-up Date"
                              helperText={errors.buDate?.message}
                              sx={{ marginBottom: 2 }}
                            />
                          );
                        }}
                      />
                    </>
                  )}
                />
                <Controller
                  name="repeat"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: {
                      value: bringUp,
                      message: 'Bring up repeat frequency cannot be empty',
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <FormControl
                      error={!!errors.repeat}
                      variant="standard"
                      sx={{ marginBottom: 4 }}
                    >
                      <InputLabel id="demo-simple-select-label">Repeat</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        label="repeat"
                        onChange={onChange}
                      >
                        {repeatType.map((item) => (
                          <MenuItem key={item.label} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!errors.repeat && <FormHelperText>{errors.repeat.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Box>
            )}
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          type="submit"
          form="subscribeForm"
          onClick={() => {
            clearErrors('no_selection');
            if (
              !getValues('checkedB') &&
              !getValues('checkedD') &&
              !getValues('checkedM') &&
              !getValues('checkedN')
            ) {
              // register('no_selection');
              setError('no_selection', {
                type: 'custom',
                message: 'Select at least one option',
              });
            }
          }}
        >
          Confirm
        </Button>
        <Button
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

export default SubscribeDialog;

export type DeleteDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onCloseAction?: () => void;
  onConfirmAction?: (data: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => void;
};
