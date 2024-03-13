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
  RadioGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { SimpleSearchItem } from 'libs/common/src/lib/api';
import { DateTime } from 'luxon';
import { useEffect, useState, useRef, CSSProperties } from 'react';

export const InputHandling = ({
  value,
  onChange,
  disabled,
  error,
  misColumnInputType,
  misColumnLabel,
  columnLs,
  style,
}: {
  value: {
    input_type: string;
    value: any;
  };
  onChange: (evt: any) => void;
  disabled: boolean;
  error: any;
  misColumnInputType: string;
  misColumnLabel: string;
  columnLs: any[];
  style: CSSProperties;
}) => {
  console.log(misColumnInputType);
  const [toolbarWidth, setToolbarWidth] = useState(400);
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (formRef.current?.clientWidth) {
      setToolbarWidth(formRef.current?.clientWidth);
    }
  }, [formRef.current?.clientWidth]);
  switch (misColumnInputType) {
    case '0':
      return (
        // <TextField
        //   disabled={disabled}
        //   //variant="standard"
        //   error={!!error}
        //   helperText={error?.message ?? ''}
        //   value={value.value}
        //   label={''}
        //   onChange={(evt) =>
        //     onChange({
        //       input_type: misColumnInputType,
        //       value: evt.target.value,
        //     })
        //   }
        //   sx={{ ...style }}
        // />
        <Typography sx={{ ...style }} style={{ marginTop: 20 }} variant="h6">
          {misColumnLabel}
        </Typography>
      );

    case '1':
      return (
        <TextField
          disabled={disabled}
          //variant="standard"
          error={!!error}
          helperText={error?.message ?? ''}
          value={value.value}
          label={misColumnLabel}
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
          <InputLabel id="demo-simple-select-label">{''}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={value.value}
            label="Age"
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
          <FormLabel>{''}</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  value={value.value}
                  checked={value.value === 'Y'}
                  onChange={(evt) =>
                    onChange({
                      input_type: misColumnInputType,
                      value: value.value === 'Y' ? 'N' : 'Y',
                    })
                  }
                  // onChange={() => {
                  //   onChange(value === 'Y' ? 'N' : 'Y');
                  // }}
                />
              }
              label={value.value === 'Y' ? 'True' : 'False'}
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
          <FormLabel>{''}</FormLabel>
          <Grid>
            {columnLs.length > 0 &&
              columnLs.map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Radio
                      value={item.value}
                      checked={item.value === value.value}
                      onChange={(evt) =>
                        onChange({
                          input_type: misColumnInputType,
                          value: item.value,
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
      console.log(value);
      return (
        <FormControl
          disabled={disabled || misColumnInputType === '5'}
          variant="standard"
          sx={{ ...style }}
        >
          <DatePicker
            disabled={disabled}
            label={''}
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
              console.log(params, error?.message);
              return (
                <TextField
                  {...params}
                  helperText={error?.message ?? params.helperText}
                  error={params.error && !!error?.message}
                  //variant="standard"
                  label={params.label}
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
          <InputLabel htmlFor="component-outlined">{''}</InputLabel>
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
            label={''}
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
                console.log('Editor is ready to use!');
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

export const DemoInputHandling = (props: SimpleSearchItem) => {
  console.log(props);
  // const [column, setColumn] = useState<TableColumn>();
  // useEffect(() => {
  //   setColumn(props);
  // }, [props]);
  const [toolbarWidth, setToolbarWidth] = useState(400);
  const formRef = useRef<HTMLDivElement | null>(null);
  console.log(formRef);
  useEffect(() => {
    if (formRef.current?.clientWidth) {
      setToolbarWidth(formRef.current?.clientWidth);
    }
  }, [formRef.current?.clientWidth]);

  switch (props?.inputType) {
    case '0':
      return (
        <Typography sx={{ marginBottom: 2, width: '100%' }} variant="h6">
          {props?.itemName}
        </Typography>
      );
    case '1':
      return <TextField variant="standard" label="" sx={{ marginBottom: 2, width: '100%' }} />;
    case '2':
      return (
        <FormControl variant="standard" sx={{ marginBottom: 2, width: '100%' }}>
          <InputLabel id="demo-simple-select-label"></InputLabel>
          <Select label="">
            <MenuItem value={10}>demo 1</MenuItem>
            <MenuItem value={20}>demo 2</MenuItem>
            <MenuItem value={30}>demo 3</MenuItem>
          </Select>
        </FormControl>
      );
    case '3':
      return (
        <FormControl variant="standard" sx={{ marginBottom: 2, width: '100%' }}>
          <FormLabel></FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label={''} />
          </FormGroup>
        </FormControl>
      );

    case '4':
      return (
        <FormControl variant="standard" sx={{ width: '100%', height: '100%' }}>
          <FormLabel>demo1</FormLabel>
          <RadioGroup
            // row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="Demo1" control={<Radio />} label="Demo1" />
            <FormControlLabel value="Demo2" control={<Radio />} label="Demo2" />
          </RadioGroup>
        </FormControl>
      );
    case '6':
      return (
        <DatePicker
          label=""
          inputFormat="yyyy-MM-dd"
          toolbarPlaceholder="YYYY-MM-DD"
          disabled
          value={DateTime.now()}
          onChange={(newValue: DateTime | null | undefined) => {
            if (newValue) {
              console.log(newValue.toFormat('yyyy-MM-dd'));
            }
          }}
          renderInput={(params) => {
            return (
              <TextField
                variant="standard"
                {...params}
                sx={{ marginBottom: 2, width: '100%' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            );
          }}
        />
      );

    case '7':
      return (
        <DatePicker
          label=""
          inputFormat="yyyy-MM-dd"
          toolbarPlaceholder="YYYY-MM-DD"
          disabled
          value={DateTime.now()}
          onChange={(newValue: DateTime | null | undefined) => {
            if (newValue) {
              console.log(newValue.toFormat('yyyy-MM-dd'));
            }
          }}
          renderInput={(params) => {
            return (
              <TextField
                variant="standard"
                {...params}
                sx={{ marginBottom: 2, width: '100%' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            );
          }}
        />
      );
    case '8':
      return (
        <FormControl sx={{ width: '100%', height: '100%' }}>
          <InputLabel htmlFor="component-outlined"></InputLabel>
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
            id="component-outlined"
            label=""
          />
        </FormControl>
      );
    case '9':
      return (
        <FormControl
          ref={formRef}
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
            ['.ck-editor__main']: {
              height: `calc(100% - 50px) !important`,
            },
            ['.ck-reset']: {
              height: '100%',
              maxHeight: '300px',
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ color: 'black' }}>
            ''
          </Typography>
          <CKEditor
            editor={EditorInstance}
            onReady={(editor) => {
              // You can store the "editor" and use when it is needed.
              console.log('Editor is ready to use!', editor);
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              console.log({ event, editor, data });
            }}
            onBlur={(_, editor) => {
              console.log('Blur.', editor);
            }}
            onFocus={(_, editor) => {
              console.log('Focus.', editor);
            }}
          />
        </FormControl>
      );
    case '10':
      return (
        // <TextField
        //   disabled={disabled}
        //   //variant="standard"
        //   error={!!error}
        //   helperText={error?.message ?? ''}
        //   value={value.value}
        //   label={''}
        //   onChange={(evt) =>
        //     onChange({
        //       input_type: misColumnInputType,
        //       value: evt.target.value,
        //     })
        //   }
        //   sx={{ ...style }}
        // />
        <></>
      );
    default:
      return (
        <FormControl sx={{ width: '100%', height: '100%' }}>
          <InputLabel htmlFor="component-outlined"></InputLabel>
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
            id="component-outlined"
            label=""
          />
        </FormControl>
      );
  }
};
