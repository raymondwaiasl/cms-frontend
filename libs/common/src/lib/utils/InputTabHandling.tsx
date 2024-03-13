import { GetTableColumnData } from '../api';
import { TableColumn } from '../api';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import EditorInstance from '@johnjaller/ckeditor5';
import CloseIcon from '@mui/icons-material/Close';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  Select,
  TextField,
  Grid,
  Typography,
  Box,
  Dialog,
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { CSSProperties, useEffect, useState, useRef } from 'react';

export const InputTabHandling = ({
  value,
  onChange,
  disabled,
  error,
  misColumnInputType,
  misColumnLabel,
  columnLs,
  style,
  name,
}: {
  value: {
    input_type: Pick<GetTableColumnData, 'misColumnInputType'>;
    value: any;
  };
  onChange: (evt: any) => void;
  disabled: boolean;
  error: any;
  style: CSSProperties;
  name: string;
} & Pick<GetTableColumnData, 'misColumnInputType' | 'misColumnLabel' | 'columnLs'>) => {
  const [toolbarWidth, setToolbarWidth] = useState(400);
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (formRef.current?.clientWidth) {
      setToolbarWidth(formRef.current?.clientWidth);
    }
  }, [formRef.current?.clientWidth]);
  switch (misColumnInputType) {
    case '1':
      return (
        <TextField
          disabled={disabled}
          //variant="standard"
          error={!!error}
          helperText={error?.message ?? ''}
          value={value.value}
          label={misColumnLabel}
          name={name}
          onChange={(evt) =>
            onChange({
              input_type: misColumnInputType,
              value: evt.target.value,
            })
          }
          sx={{ ...style }}
        />
      );

    case '2':
      return (
        <FormControl
          disabled={disabled}
          error={!!error?.message}
          variant="standard"
          sx={{ ...style }}
        >
          <InputLabel id="demo-simple-select-label">{misColumnLabel}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={value.value}
            label="Age"
            name={name}
            onChange={(evt) => {
              onChange({
                input_type: misColumnInputType,
                value: evt.target.value,
              });
            }}
          >
            {columnLs.length > 0 &&
              columnLs.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.value}
                </MenuItem>
              ))}
          </Select>
          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );

    case '3':
      return (
        <FormControl
          disabled={disabled}
          error={!!error?.message}
          //variant="standard"
          sx={{ ...style }}
        >
          <FormLabel>{misColumnLabel}</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name={name}
                  value={value.value}
                  checked={value.value === '1'}
                  onChange={(evt) =>
                    onChange({
                      input_type: misColumnInputType,
                      value: value.value === '1' ? '0' : '1',
                    })
                  }
                  // onChange={() => {
                  //   onChange(value === 'Y' ? 'N' : 'Y');
                  // }}
                />
              }
              label={value.value === '1' ? 'True' : 'False'}
            />
          </FormGroup>
          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );

    case '4':
      return (
        <FormControl
          disabled={disabled}
          error={!!error?.message}
          //variant="standard"
          sx={{ ...style }}
        >
          <FormLabel>{misColumnLabel}</FormLabel>
          <Grid>
            {columnLs.length > 0 &&
              columnLs.map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Radio
                      value={value.value}
                      name={name}
                      checked={item.key === value.value}
                      onChange={(evt) =>
                        onChange({
                          input_type: misColumnInputType,
                          value: item.key,
                        })
                      }
                    />
                  }
                  label={item.value}
                />
              ))}
          </Grid>

          {/* <FormControlLabel
            control={
              <Radio
                value={value.value}
                checked={value.value === 'Y'}
                onChange={(evt) =>
                  onChange({
                    input_type: misColumnInputType,
                    value: value.value === 'Y' ? 'N' : 'Y',
                  })
                }
              />
            }
            label={value.value === 'Y' ? 'True' : 'False'}
          /> */}
          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );

    case '5':
    case '6':
    case '7':
      return (
        <FormControl
          disabled={disabled || misColumnInputType === '5'}
          variant="standard"
          sx={{ ...style }}
        >
          <DatePicker
            disabled={disabled}
            label={misColumnLabel}
            inputFormat="yyyy-MM-dd"
            value={
              value.value
                ? typeof value.value === 'string'
                  ? value.value
                  : DateTime.fromMillis(value.value)
                : ''
            }
            onChange={(newValue: DateTime | null | undefined) => {
              if (newValue) {
                onChange({
                  input_type: misColumnInputType,
                  value: newValue.toFormat('yyyy-MM-dd'),
                });
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  helperText={error?.message ?? params.helperText}
                  error={params.error && !!error?.message}
                  //variant="standard"
                  label={params.label}
                  name={name}
                  inputProps={{
                    ...params.inputProps,
                    placeholder: misColumnInputType === '5' ? 'Generated by System' : '',
                    value: value.value,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ marginBottom: 2 }}
                  // InputLabelProps={{
                  //   shrink: true,
                  // }}
                />
              );
            }}
          />

          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );
    case '8':
      return (
        <FormControl
          error={!!error?.message}
          disabled={disabled}
          sx={{ width: '100%', height: '100%', ...style }}
        >
          <InputLabel htmlFor="component-outlined">{misColumnLabel}</InputLabel>
          <OutlinedInput
            multiline
            fullWidth
            rows={1}
            sx={{
              height: '100%',
            }}
            inputProps={{
              style: {
                height: '100%',
              },
            }}
            onChange={(evt) => {
              onChange({
                input_type: misColumnInputType,
                value: evt.target.value,
              });
            }}
            value={value.value}
            id="component-outlined"
            label={misColumnLabel}
          />

          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );
    case '9':
      return (
        <>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
                Preview
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ minHeight: '400px' }}>
              <div dangerouslySetInnerHTML={{ __html: value.value ?? '' }} />
            </DialogContent>
          </Dialog>
          <FormControl
            ref={formRef}
            error={!!error?.value}
            disabled={disabled}
            sx={{
              width: '100%',
              height: '100%',
              ['.ck-editor__editable']: {
                overflow: 'auto',
                height: '100%',
              },
              ['.ck-sticky-panel__content']: {
                zIndex: 1,
              },
              ['.ck-dropdown__panel']: {
                maxWidth: `${toolbarWidth}px !important`,
              },
              ...style,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">{misColumnLabel}</Typography>
              <Button onClick={() => setDialogOpen(true)}>Preview</Button>
            </Box>
            <CKEditor
              editor={EditorInstance}
              data={value.value ?? ''}
              onReady={(editor) => {
                // You can store the "editor" and use when it is needed.
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                onChange({
                  input_type: misColumnInputType,
                  value: data,
                });
                console.log({ event, editor, data });
              }}
              onBlur={(_, editor) => {
                console.log('Blur.', editor);
              }}
              onFocus={(_, editor) => {
                console.log('Focus.', editor);
              }}
            />

            {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        </>
      );

    default:
      return (
        <TextField
          //variant="standard"
          disabled={disabled}
          error={!!error}
          helperText={error?.message ?? ''}
          value={value.value}
          label={misColumnLabel}
          name={name}
          onChange={(evt) =>
            onChange({
              input_type: misColumnInputType,
              value: evt.target.value,
            })
          }
          sx={{ ...style }}
        />
      );
  }
};
