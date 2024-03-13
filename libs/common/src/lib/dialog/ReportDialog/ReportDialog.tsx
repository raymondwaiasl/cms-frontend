import { ExportReportInput } from '../../api';
import { useApi, useDialog } from '../../hooks';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';

const ReportDialog: FC<DeleteDialogProps> = ({ isOpen, onCloseAction }) => {
  const client = useApi();

  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    data: InputDataType;
    onConfirmAction: (data: ExportReportInput) => void;
  }>('reportDialog');

  console.log(data);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      templateId: '',
      typeId: '',
      dateFrom: '',
      dateTo: '',
      format: '',
    },
  });

  const { data: templateList } = useQuery(['Template'], async () => {
    const { data: templateData } = await client.report.getTemplate();
    return templateData;
  });

  const { data: typeDicList } = useQuery(['TypeDic'], async () => {
    const { data: typeDicData } = await client.queryForm.getTypeDic();
    return typeDicData;
  });

  const onSubmit = (formData: ExportReportInput) => {
    data?.onConfirmAction && data?.onConfirmAction(formData);
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
          {'Report Config'}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minWidth: '400px' }}>
        <form id="reportForm" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', marginY: 1, flexDirection: 'column' }}>
            <Controller
              name="templateId"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl variant="standard" error={!!errors.templateId}>
                  <InputLabel id="demo-simple-select-standard-label">Report Type</InputLabel>
                  <Select
                    displayEmpty
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    onChange={onChange}
                  >
                    {templateList?.map((temp: any) => (
                      <MenuItem value={temp.misReportTempId}>{temp.misReportTempName}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors?.templateId?.message as string}</FormHelperText>
                </FormControl>
              )}
            />

            {watch('templateId') === '0056000000000002' && (
              <Controller
                name="typeId"
                control={control}
                rules={{
                  required: 'This Field is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" error={!!errors.typeId}>
                    <InputLabel id="demo-simple-select-standard-label">Table</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value}
                      onChange={onChange}
                    >
                      {typeDicList?.map((table) => {
                        return (
                          <MenuItem value={table.key} key={table.key}>
                            {table.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>{errors?.typeId?.message as string}</FormHelperText>
                  </FormControl>
                )}
              />
            )}
            <Controller
              name="dateFrom"
              defaultValue=""
              rules={{
                required: 'This Field is required',
              }}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <DatePicker
                    label="Creation Date From"
                    inputFormat="dd/MM/yyyy"
                    value={value}
                    onChange={(newValue: DateTime | null | undefined) => {
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
                          error={!!errors?.dateFrom?.type}
                          label="Creation Date From"
                          helperText={errors.dateFrom?.message}
                          sx={{ marginBottom: 2 }}
                        />
                      );
                    }}
                  />
                </>
              )}
            />

            <Controller
              name="dateTo"
              defaultValue=""
              rules={{
                required: 'This Field is required',
              }}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <DatePicker
                    label="Creation Date To"
                    inputFormat="dd/MM/yyyy"
                    value={value}
                    onChange={(newValue: DateTime | null | undefined) => {
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
                          error={!!errors?.dateTo?.type}
                          label="Creation Date To"
                          helperText={errors.dateTo?.message}
                          sx={{ marginBottom: 2 }}
                        />
                      );
                    }}
                  />
                </>
              )}
            />

            <Controller
              name="format"
              rules={{
                required: 'This Field is required',
              }}
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl variant="standard" error={!!errors.format}>
                  <InputLabel id="demo-simple-select-standard-label">Report Format</InputLabel>

                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    onChange={onChange}
                  >
                    <MenuItem value={'pdf'}>PDF</MenuItem>
                    <MenuItem value={'csv'}>CSV</MenuItem>
                    <MenuItem value={'excel'}>EXCEL</MenuItem>
                  </Select>
                  <FormHelperText>{errors?.format?.message as string}</FormHelperText>
                </FormControl>
              )}
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" type="submit" form="reportForm">
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

export default ReportDialog;

export type DeleteDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onCloseAction?: () => void;
  onConfirmAction?: (formData: ExportReportInput) => void;
};

export interface InputDataType {
  isStatistics?: boolean;
}
