import { TableColumn, GetTableColumnData, MisColumnInputType } from '../api';
import { list_to_tree } from './functions';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import EditorInstance from '@johnjaller/ckeditor5';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { TreeView } from '@mui/lab';
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
  DialogActions,
  DialogTitle,
  IconButton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import { DatePicker } from '@mui/x-date-pickers';
import { FolderTree } from 'libs/common/src/lib/api/folderService';
import { GetTableData } from 'libs/common/src/lib/api/recordService';
import { linkOpeningWay } from 'libs/common/src/lib/constant';
import { useApi } from 'libs/common/src/lib/hooks';
import FolderItem from 'libs/common/src/lib/widget/molecules/FolderItem/FolderItem';
import { DateTime } from 'luxon';
import { CSSProperties, useEffect, useState, useMemo, useRef } from 'react';
import type { FieldError } from 'react-hook-form';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { useQuery } from 'react-query';
import { object, string, number, ValidationError } from 'yup';

export const InputHandling = ({
  value,
  onChange,
  disabled,
  error,
  misColumnInputType,
  misColumnLabel,
  columnLs,
  style,
  suggestionColumns,
}: {
  value: {
    input_type: MisColumnInputType;
    value: any;
  };
  onChange: (evt: any) => void;
  disabled: boolean;
  error: any;
  style: CSSProperties;
  suggestionColumns?: GetTableData[];
} & Pick<GetTableColumnData, 'misColumnInputType' | 'misColumnLabel' | 'columnLs'>) => {
  const [toolbarWidth, setToolbarWidth] = useState(400);
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (formRef.current?.clientWidth) {
      setToolbarWidth(formRef.current?.clientWidth);
    }
  }, [formRef.current?.clientWidth]);
  const setValue = (str: string) => {
    onChange({
      input_type: misColumnInputType,
      value: str,
    });
  };
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
            onChange={(evt) => {
              onChange({
                input_type: misColumnInputType,
                value: evt.target.value,
              });
            }}
          >
            {columnLs &&
              columnLs?.length > 0 &&
              columnLs.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.value}
                </MenuItem>
              ))}
          </Select>
          {!!error && <FormHelperText>{error.message}</FormHelperText>}
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
          error={!!error}
          //variant="standard"
          sx={{ ...style }}
        >
          <FormLabel>{misColumnLabel}</FormLabel>
          <Grid>
            {columnLs?.length > 0 &&
              columnLs.map((item) => (
                
                <FormControlLabel
                  key={item.key}
                  control={
                    <Radio                  
                      value={value.value}
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
      console.log(value);
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
            // onBlur={onBlur}
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
            error={!!error?.message}
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
    case '10':
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
    case '11':
      return (
        <FormControl
          disabled={disabled}
          error={!!error?.message}
          variant="standard"
          sx={{ ...style, width: 300 }}
        >
          {/* <InputLabel id="demo-simple-select-label">{misColumnLabel}</InputLabel> */}
          <Autocomplete
            disablePortal
            disabled={disabled}
            id="combo-box-demo"
            options={suggestionColumns ? suggestionColumns.map((item) => item.value) : []}
            freeSolo
            renderInput={(params) => <TextField {...params} label={misColumnLabel} />}
            inputValue={value.value}
            onInputChange={(evt, val) => {
              onChange({
                input_type: misColumnInputType,
                value: val,
              });
            }}
          />
          {/* {!!error?.message && <FormHelperText>{error.message}</FormHelperText>} */}
        </FormControl>
      );
    case '12':
      const defaultValues: Array<string> = [];
      if (value.value) {
        try {
          const parse = JSON.parse(value.value);
          if (parse instanceof Array) {
            // setValues(parse);
            (parse as Array<string>).forEach((s) => defaultValues.push(s));
          }
        } catch (err) {}
      }
      const [values, setValues] = useState<string[]>(defaultValues);
      useEffect(() => {
        if (!disabled) {
          setValues([]);
        }
      }, [columnLs]);
      return (
        <FormControl
          disabled={disabled}
          error={!!error?.message}
          variant="standard"
          sx={{ ...style, minWidth: '200px' }}
        >
          {/* <InputLabel id="demo-simple-select-label">{misColumnLabel}</InputLabel> */}
          <Autocomplete
            multiple
            id="tags-outlined"
            options={columnLs?.map((c) => c.value) || []}
            getOptionLabel={(option) => option}
            filterSelectedOptions
            value={values}
            disabled={disabled}
            disableCloseOnSelect
            onChange={(e, newValues) => {
              setValues(newValues);
              onChange({
                input_type: misColumnInputType,
                value: JSON.stringify(newValues),
              });
            }}
            renderInput={(params) => (
              <TextField {...params} label={misColumnLabel} placeholder={misColumnLabel} />
            )}
          />
          {!!error?.message && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      );
    case '13':
      const defaultValue: { [key: string]: string } = {};
      if (value.value) {
        try {
          const obj = JSON.parse(value.value);
          defaultValue.issuer = obj.issuer;
          defaultValue.url = obj.url;
          defaultValue.openMethod = obj.openMethod;
        } catch (err) {}
      }
      const [issuer, setIssuer] = useState<string>(defaultValue.issuer || '');
      const [url, setUrl] = useState<string>(defaultValue.url || '');
      const [openMethod, setOpenMethod] = useState<string>(defaultValue.openMethod || '');
      useEffect(() => {
        onChange({
          input_type: misColumnInputType,
          value: JSON.stringify({ issuer: issuer, url: url, openMethod: openMethod }),
        });
      }, [issuer, url, openMethod]);
      return (
        <FormControl
          variant="standard"
          sx={{ width: '600px', height: '100%', ...style }}
          disabled={disabled}
          error={!!error?.message}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                // error={!!ColumnErrors.misColumnComputeQuery}
                variant="standard"
                onChange={(e) => {
                  setIssuer(e.target.value);
                }}
                value={issuer}
                defaultValue=""
                margin="normal"
                label="Issuer"
                // helperText={ColumnErrors.misColumnComputeQuery?.message as string}
                disabled={disabled}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                // error={!!ColumnErrors.misColumnComputeQuery}
                variant="standard"
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                value={url}
                defaultValue=""
                margin="normal"
                label="URL"
                // helperText={ColumnErrors.misColumnComputeQuery?.message as string}
                disabled={disabled}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={1} sx={{ marginTop: '32px', textAlign: 'center' }}>
              {'in'}
            </Grid>
            <Grid item xs={3} sx={{ marginTop: '16px' }}>
              <>
                <Select
                  // autoWidth
                  // error={!!ColumnErrors.misColumnType}
                  // labelId="open-page-way"
                  id="open-method-select"
                  disabled={disabled}
                  value={openMethod}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setOpenMethod(e.target.value);
                  }}
                  label="Open Method"
                  sx={{ width: '100%', marginTop: '16px' }}
                >
                  {linkOpeningWay.map((item) => (
                    <MenuItem value={item.key} key={item.key} sx={{ width: '100%' }}>
                      {item.value}
                    </MenuItem>
                  ))}
                </Select>
              </>
            </Grid>
          </Grid>
        </FormControl>
      );
    case '14':
      const [open, setOpen] = useState(false);
      const [nodeList, setNodeList] = useState<string[]>([]);
      const [currentNodeList, setCurrentNodeList] = useState<string[]>([]);
      const client = useApi();
      const { data } = useQuery(
        'Folder Browser',
        async () => {
          const { data: response } = await client.folderService.getFolderList();
          return response;
        },
        {
          enabled: misColumnInputType === '14',
        }
      );

      const folderTree = useMemo(() => {
        const result = data
          ? list_to_tree(
              data.map((item) => ({ ...item, name: item.misFolderName })),
              'misFolderParentId',
              'misFolderId'
            )
          : [];
        return result;
      }, [data]);

      function getFullPath(
        folderTree: FolderTree[],
        nodeId: string,
        nameArray: string[],
        depth: number
      ): string {
        if (depth == 0) {
          currentNodeList.splice(0, currentNodeList.length);
        }
        if (folderTree.length == 0 || !nodeId) {
          return '';
        }
        const folder = folderTree.find((f) => f.misFolderId == nodeId);
        if (folder) {
          currentNodeList.push(folder.misFolderId);
          nameArray.push(folder.misFolderName);
        }
        if (!folder || !folder.misFolderParentId) {
          return nameArray.reverse().join('\\');
        }
        return getFullPath(folderTree, folder?.misFolderParentId || '', nameArray, depth + 1);
      }

      interface folderLists extends FolderTree {
        children?: FolderTree[];
      }

      const renderTree = (items: folderLists[], level: number) => {
        return items.map((item) => (
          <FolderItem
            key={item.misFolderId as string}
            nodeId={item.misFolderId as string}
            label={item.misFolderName as string}
            hasChildren={item.children && item.children.length > 0}
            onAddFolderClick={() => {}}
            onDeleteClick={() => {}}
            onRenameClick={() => {}}
            showEditIcons={false}
            onDoubleClick={(e) => {
              setValue(item.misFolderId);
              setCurrId(item.misFolderId);
              setOpen(false);
              e.stopPropagation();
            }}
          >
            {Array.isArray(item.children) && renderTree(item.children, level + 1)}
          </FolderItem>
        ));
      };

      const [currId, setCurrId] = useState('');
      return (
        <>
          <FormControl
            disabled={disabled}
            error={!!error?.message}
            variant="standard"
            sx={{ ...style, minWidth: 500 }}
          >
            <TextField
              value={getFullPath(data || [], value.value, [], 0)}
              id="input-with-icon-textfield"
              label={misColumnLabel}
              disabled={disabled}
              sx={{
                '& div,input': {
                  cursor: 'pointer',
                },
              }}
              // disabled
              InputProps={{
                startAdornment: !!!value.value && (
                  <InputAdornment position="start">Click To Select</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <FolderOpenOutlinedIcon />
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              onClick={(e) => {
                setCurrId(value.value);
                currentNodeList.forEach((id) => {
                  if (!nodeList.includes(id)) {
                    nodeList.push(id);
                  }
                });
                setOpen(true);
              }}
              variant="outlined"
            />

            <Dialog
              disableEscapeKeyDown
              open={open}
              onClose={(e) => setOpen(false)}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: '400px',
                  minHeight: '600px',
                },
              }}
            >
              <DialogTitle>Fill the form</DialogTitle>
              <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <TreeView
                    defaultExpandIcon={<BsChevronRight />}
                    defaultCollapseIcon={<BsChevronDown />}
                    expanded={nodeList}
                    onNodeToggle={(evt, ids) => {
                      /**setNodeList(ids) */
                    }}
                    // className={styles.folderTree}
                    onNodeSelect={async (evt: any, id: string) => {
                      setCurrId(id);
                    }}
                  >
                    <TreeView
                      defaultExpandIcon={<BsChevronRight />}
                      defaultCollapseIcon={<BsChevronDown />}
                      expanded={nodeList}
                      onNodeToggle={(evt, ids) => {
                        console.log(ids);
                        setNodeList(ids);
                      }}
                      sx={{
                        height: '100%',
                        flexGrow: 1,
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '12px',
                      }}
                      selected={currId}
                      onNodeSelect={async (evt: any, id: string) => {
                        setCurrId(id);
                      }}
                    >
                      {renderTree(folderTree, 0)}
                    </TreeView>
                  </TreeView>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={(e) => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={(e) => {
                    setValue(currId);
                    setOpen(false);
                  }}
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
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

export const typeChecking = (key: string, value: any, isRequired: boolean) => {
  try {
    switch (key) {
      case '0':
        return isRequired
          ? string().oneOf(['Y', 'N']).required('This input is required').validateSync(value, {
              abortEarly: true,
            })
          : string().oneOf(['Y', 'N']).nullable().validateSync(value, {
              abortEarly: true,
            });

      case '1':
      case '3':
        return isRequired
          ? string().required('This input is required').validateSync(value, {
              abortEarly: true,
            })
          : string().nullable().validateSync(value, {
              abortEarly: true,
            });
      case '2':
        return isRequired
          ? number()
              .integer("This input isn't interger")
              .required('This input is required')
              .validateSync(value, {
                abortEarly: true,
              })
          : number().nullable().integer("This input isn't interger").validateSync(value, {
              abortEarly: true,
            });

      case '5':
        return isRequired
          ? number().required('This input is required').validateSync(value, {
              abortEarly: true,
            })
          : number().nullable().validateSync(value, {
              abortEarly: true,
            });
      case '4':
        return isRequired
          ? string()
              .test(
                'is-date-valid',
                'Date is not Valid',
                (val) => typeof val === 'string' && DateTime.fromFormat(val, 'yyyy-MM-dd').isValid
              )
              .required('This field is required')
              .validateSync(value)
          : string()
              .nullable()
              .test(
                'is-date-valid',
                'Date is not Valid',
                (val) => typeof val === 'string' && DateTime.fromFormat(val, 'yyyy-MM-dd').isValid
              )
              .validateSync(value, {
                abortEarly: true,
              });

      default:
        return isRequired
          ? string().required('This input is required').validateSync(value, {
              abortEarly: true,
            })
          : string().nullable().validateSync(value, {
              abortEarly: true,
            });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.message;
    }
    return error;
  }
};
export const yupChecking = ({
  inputType,
  valueType,
  isRequired,
  maxLength,
  label,
}: {
  inputType: string;
  valueType: string;
  isRequired: boolean;
  maxLength: number;
  label: string;
}) => {
  const commonShape = object().shape({
    input_type: string().required().default(inputType),
  });
  let schema = valueType === '2' ? number().label(label) : string().label(label);
  switch (valueType) {
    case '0':
      schema = string().label(label).oneOf(['Y', 'N']);
      schema = isRequired
        ? schema.required(({ label }) => `${label} is required`)
        : schema.notRequired();
      schema = maxLength ? schema.max(maxLength) : schema;
      return object().concat(commonShape.concat(object({ value: schema })));

    case '1':
    case '3':
      schema = isRequired
        ? schema.required(({ label }) => `${label} is required`)
        : schema.notRequired();
      schema = maxLength ? schema.max(maxLength) : schema;
      return object().concat(commonShape).shape({ value: schema });
    case '5':
      schema = string()
        .test('Digits only', 'The field should have digits only', (value) =>
          /^\d+$/.test(value ?? '')
        )
        .transform((val) => val.toString());
      schema = isRequired
        ? schema.required(({ label }) => `${label} is required`)
        : schema.notRequired();
      schema = maxLength ? schema.max(maxLength) : schema;
      return object().concat(commonShape.concat(object({ value: schema })));
    case '2':
      schema = string().label(label).notRequired();

      if (isRequired) schema = schema.required(({ label }) => `${label} is required`);

      schema = schema
        .test(
          'Not float number',
          'decimal number is not allowed',
          (val) => typeof Number(val) === 'number' && !val?.toString().match(/^\d*\.{1}\d*$/)
        )
        .transform((val) => (val ? val.toString() : null));
      console.log(isRequired);
      schema = maxLength ? schema.max(maxLength) : schema;
      return object().concat(commonShape.concat(object({ value: schema })));

    case '4':
      schema = string()
        .label(label)
        .default(DateTime.now().toFormat('yyyy-MM-dd'))
        .test(
          'is-date-valid',
          'Date is not Valid',
          (val) => typeof val === 'string' && DateTime.fromFormat(val, 'yyyy-MM-dd').isValid
        );
      schema = isRequired ? schema.required() : schema.notRequired();
      schema = maxLength ? schema.max(maxLength) : schema;
      return object().concat(commonShape.concat(object({ value: schema })));
    default:
      return object().concat(commonShape.concat(object({ value: schema })));
  }
};

export const DemoInputHandling = (props: TableColumn) => {
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

  switch (props?.misColumnInputType) {
    case '1':
      return (
        <TextField
          variant="standard"
          label={props.misColumnLabel}
          sx={{ marginBottom: 2, width: '100%' }}
        />
      );
    case '2':
      return (
        <FormControl variant="standard" sx={{ marginBottom: 2, width: '100%' }}>
          <InputLabel id="demo-simple-select-label">{props.misColumnLabel}</InputLabel>
          <Select label={props.misColumnLabel}>
            <MenuItem value={10}>demo 1</MenuItem>
            <MenuItem value={20}>demo 2</MenuItem>
            <MenuItem value={30}>demo 3</MenuItem>
          </Select>
        </FormControl>
      );
    case '3':
      return (
        <FormControl variant="standard" sx={{ marginBottom: 2, width: '100%' }}>
          <FormLabel>{props.misColumnLabel}</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label={'Checkbox'} />
          </FormGroup>
        </FormControl>
      );

    case '4':
      return (
        <FormControl variant="standard" sx={{ width: '100%', height: '100%' }}>
          <FormLabel>{props.misColumnLabel}</FormLabel>
          <Radio />
        </FormControl>
      );
    case '6':
      return (
        <DatePicker
          label={props?.misColumnLabel}
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
          label={props?.misColumnLabel}
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
          <InputLabel htmlFor="component-outlined">{props?.misColumnLabel}</InputLabel>
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
            label={props?.misColumnLabel}
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
            {props?.misColumnLabel}
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
    default:
      return (
        <FormControl sx={{ width: '100%', height: '100%' }}>
          <InputLabel htmlFor="component-outlined">{props?.misColumnLabel}</InputLabel>
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
            label={props?.misColumnLabel}
          />
        </FormControl>
      );
  }
};
