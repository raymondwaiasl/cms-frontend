import styles from './query-form-detail.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import {
  QfColumns,
  QueryFormDetail,
  QueryTableDetail,
  QueryFormDetailCrossRef,
  DicItem,
  QfConditions,
} from 'libs/common/src/lib/api';
import { useApi, useWidget } from 'libs/common/src/lib/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { ValidationError } from 'yup';

const ConditionArr = [
  { key: '0', value: 'like' },
  { key: '1', value: '=' },
  { key: '2', value: '<=' },
  { key: '3', value: '>=' },
];

const schema = yup.object().shape({
  misQfName: yup.string().required('This Field is required'),
  misQfTableId: yup.string().required('This Field is required'),
  qfConditions: yup
    .array()
    .of(
      yup.object().shape({
        misQfc2ColumnId: yup.string().required('This Field is required'),
        misQfc2Condition: yup.string().required('This Field is required'),
        misQfc2Value: yup.string().required('This Field is required'),
      })
    )
    .test('test-0', 'test-msg', (valueArr: any, context: any) => {
      const errors = [];
      for (let i = 0; i < valueArr?.length; i++) {
        if (i > 0 && valueArr[i].misRelation === '') {
          errors.push(
            new ValidationError(
              'This Field is required',
              valueArr[i],
              `qfConditions.${i}.misRelation`
            )
          );
        }
      }
      if (errors.length === 0) {
        return true;
      }
      return new ValidationError(errors);
    }),
  qfColumns: yup.array().min(1, 'Please select at least one').required('Required'),
  crossRef: yup.array().of(
    yup.object().shape({
      misQfTableId: yup.string().required('This Field is required'),
      qfConditions: yup
        .array()
        .of(
          yup.object().shape({
            misQfc2ColumnId: yup.string().required('This Field is required'),
            misQfc2Condition: yup.string().required('This Field is required'),
            misQfc2Value: yup.string().required('This Field is required'),
          })
        )
        .test('test-0', 'test-msg', (valueArr: any, context: any) => {
          const errors = [];
          for (let i = 0; i < valueArr?.length; i++) {
            if (i > 0 && valueArr[i].misRelation === '') {
              errors.push(
                new ValidationError(
                  'This Field is required',
                  valueArr[i],
                  context.path + '.' + i + '.misRelation'
                )
              );
            }
          }
          if (errors.length === 0) {
            return true;
          }
          return new ValidationError(errors);
        }),
      qfColumns: yup.array().min(1, 'Please select at least one').required('Required'),
    })
  ),
});

const QueryFormDetailPage = () => {
  const client = useApi();
  const history = useHistory();
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);

  const [tableList, setTableList] = useState<QueryTableDetail[]>();
  const [columnList, setColumnList] = useState<QueryTableDetail[]>();
  const [showItems, setShowItems] = useState<QueryTableDetail[]>();
  const [queryFormDetail, setQueryFormDetail] = useState<QueryFormDetail>();

  const [errorMsg, setErrorMsg] = useState('');

  const [crossRefOption, setCrossRefOption] = useState<DicItem[][]>([]);
  const [crossRefColumnList, setCrossRefColumnList] = useState<QueryTableDetail[][]>([]);
  const [crossRefShowItems, setCrossRefShowItems] = useState<QueryTableDetail[][]>([]);
  const [openShowMore, setOpenShowMore] = useState(false);

  const [dialogShowItems, setDialogShowItems] = useState<QueryTableDetail[]>();
  const [dialogCheckItems, setDialogCheckItems] = useState<QfColumns[]>();

  type updateFormQfColumnsFn = {
    update: (c: QfColumns[]) => void;
  };
  const [dialogUpdateFn, setDialogUpdateFn] = useState<updateFormQfColumnsFn>();

  // react hook form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
    defaultValues: {
      misQfName: queryFormDetail?.misQfName,
      misQfTableId: queryFormDetail?.misQfTableId,
      qfConditions: queryFormDetail?.qfConditions,
      qfColumns: queryFormDetail?.qfColumns ?? [],
      crossRef: queryFormDetail?.crossRef ?? [],
    },
    shouldUnregister: true,
  });

  const { fields, append, remove } = useFieldArray({
    name: 'qfConditions',
    control,
  });

  const {
    fields: crossRef,
    append: appendCrossRef,
    remove: removeCrossRef,
    update: updateCrossRef,
  } = useFieldArray({
    name: 'crossRef',
    control,
  });

  useEffect(() => {
    getTableListOnPage();
    if (paramId) {
      fetchDataById(paramId);
    } else {
      setQueryFormDetail({
        misQfId: '',
        misQfName: '',
        misQfTableId: '',
        qfConditions: [
          {
            misQfc2ColumnId: '',
            misQfc2Condition: '',
            misQfc2Value: '',
            misRelation: '',
          },
        ],
        qfColumns: [],
      });
    }
  }, [paramId]);

  const EditQueryForm = useMutation(client.queryForm.editQueryForm, {
    onSuccess: () => {
      history.push(route.queryForm);
    },
  });

  const AddQueryForm = useMutation(client.queryForm.addQueryForm, {
    onSuccess: () => {
      history.push(route.queryForm);
    },
  });

  const submitHandling = async (data: any) => {
    try {
      if (paramId) {
        EditQueryForm.mutate({
          ...data,
          misQfId: queryFormDetail?.misQfId,
          misQfPublic: queryFormDetail?.misQfPublic,
        });
      } else {
        AddQueryForm.mutate({ ...data, misQfId: '' });
      }
    } catch (error: any) {
      setErrorMsg(error?.message as string);
    }
  };

  //编辑时回显数据
  const fetchDataById = async (id: any) => {
    const { data: response } = await client.queryForm.getQueryFormById({ id });
    setQueryFormDetail({
      misQfId: response.misQfId,
      misQfPublic: response.misQfPublic,
      misQfName: response.misQfName,
      misQfTableId: response.misQfTableId,
      qfConditions: response.qfConditions,
      qfColumns: response.qfColumns,
      crossRef: response.crossRef,
    });
    removeAfterCrossRef(0);
    setCrossRefColumnList([]);
    if (response.crossRef && response.crossRef.length > 0) {
      response.crossRef.map((cr, i) => {
        const tableIds = [...crossRef.map((r) => r.misQfTableId), response.misQfTableId].join();
        client.typeRefService.getCrossRefById({ id: tableIds }).then((result) => {
          if (result.data.length > 0) {
            crossRefOption.push(result.data);
            setCrossRefOption([...crossRefOption]);
          }
        });

        client.queryForm.getColumnDic({ id: cr.misQfTableId ?? '' }).then((result) => {
          const array: QueryTableDetail[] = result.data;
          crossRefShowItems.push(array);
          setCrossRefShowItems([...crossRefShowItems]);
          crossRefColumnList.push(array.filter((detail) => detail?.allowSearch == 'Y'));
          setCrossRefColumnList([...crossRefColumnList]);
        });

        appendCrossRef(cr);
      });
      setValue('crossRef', response.crossRef);
    }
  };

  const getTableListOnPage = async () => {
    const { data: response } = await client.queryForm.getTypeDic();
    setTableList(response);
  };

  const misQfTableId =
    useWatch({
      control,
      name: 'misQfTableId',
    }) ?? queryFormDetail?.misQfTableId;

  const getColumnDicByTableId = useCallback(async () => {
    const { data: response } = await client.queryForm.getColumnDic({
      id: misQfTableId ?? '',
      // allowSearch:'Y',
    });
    const array: QueryTableDetail[] = response;
    setShowItems(array);
    setColumnList(array.filter((detail) => detail?.allowSearch == 'Y'));
  }, [misQfTableId]);

  useEffect(() => {
    if (queryFormDetail) {
      reset({
        misQfName: queryFormDetail?.misQfName,
        misQfTableId: queryFormDetail?.misQfTableId,
        qfConditions: queryFormDetail?.qfConditions,
        qfColumns: queryFormDetail?.qfColumns,
      });
    }
  }, [queryFormDetail]);

  useEffect(() => {
    getColumnDicByTableId();
  }, [getColumnDicByTableId]);

  const handleSelect = (columnId: any, arr?: QfColumns[]) => {
    if (arr) {
      return arr.find((item) => item.misQfcColumnId === columnId)
        ? arr.filter((item) => item.misQfcColumnId !== columnId)
        : [...arr, { misQfId: '', misQfcColumnId: columnId, misQfcId: '' }];
    }
    return arr;
  };

  const addCrossRef = async () => {
    const tableIds = [...crossRef.map((r) => r.misQfTableId), misQfTableId].join();
    //2.增加cross ref option
    client.typeRefService.getCrossRefById({ id: tableIds }).then((result) => {
      if (result.data.length > 0) {
        appendCrossRef({
          misQfTableId: '',
          misQfName: 'cross reference',
          qfConditions: [
            {
              misQfc2ColumnId: '',
              misQfc2Condition: '',
              misQfc2Value: '',
              misRelation: '',
            },
          ],
          qfColumns: [],
        });

        crossRefOption.push(result.data);
        setCrossRefOption([...crossRefOption]);
      } else {
        toast('No cross references found', {
          type: 'info',
        });
      }
    });
  };

  const refreshCrossRef = async (tableId: string | undefined, pos: number) => {
    if (!tableId) {
      return;
    }

    if (pos == -1) {
      setValue('crossRef', []);
      setCrossRefOption([]);
      removeAfterCrossRef(0);
      setCrossRefColumnList([]);
      setValue('qfColumns', []);
      return;
    }
    crossRef[pos].misQfTableId = tableId;
    crossRef[pos].qfColumns = [];
    updateCrossRef(pos, crossRef[pos]);
    // setValue('crossRef',crossRef.slice(0,pos + 1));
    removeAfterCrossRef(pos + 1);
    setCrossRefOption([...crossRefOption.slice(0, pos + 1)]);
    const { data: columns } = await client.queryForm.getColumnDic({
      id: tableId ?? '',
      // allowSearch:'Y',
    });
    const array: QueryTableDetail[] = columns;
    setCrossRefShowItems([...crossRefShowItems.slice(0, pos), array]);
    setCrossRefColumnList([
      ...crossRefColumnList.slice(0, pos),
      array.filter((detail) => detail?.allowSearch == 'Y'),
    ]);
  };

  const getTableNameById = (tableId: string | undefined): string => {
    return tableList?.find((item) => item.key === tableId)?.value ?? '';
  };

  const addEmptyCrossRefQfConditions = (pos: number) => {
    crossRef[pos]?.qfConditions?.push({
      misQfc2ColumnId: '',
      misQfc2Condition: '',
      misQfc2Value: '',
      misRelation: '',
    });
    updateCrossRef(pos, crossRef[pos]);
  };

  const removeCrossRefQfConditions = (pos: number, i: number) => {
    crossRef[pos]?.qfConditions?.splice(i, 1);
    updateCrossRef(pos, crossRef[pos]);
  };

  const removeAfterCrossRef = (pos: number) => {
    var tail = crossRef.length - 1;
    if (tail == -1) return;
    while (tail >= pos) {
      removeCrossRef(tail--);
    }
  };

  const deleteCrossRef = (pos: number) => {
    removeAfterCrossRef(pos);
    setCrossRefOption([...crossRefOption.slice(0, pos)]);
    setCrossRefColumnList([...crossRefColumnList.slice(0, pos)]);
    setCrossRefShowItems([...crossRefShowItems.slice(0, pos)]);
  };

  return (
    <div>
      <Typography variant="h6">Query Form Detail</Typography>
      <form onSubmit={handleSubmit(submitHandling)}>
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="misQfName"
            control={control}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                InputLabelProps={{ shrink: !!value || isDirty }}
                id="standard-basic"
                variant="standard"
                error={!!errors.misQfName}
                onChange={onChange}
                value={value ?? queryFormDetail?.misQfName}
                label="Query Form Name"
                helperText={errors?.misQfName?.message as string}
              />
            )}
          />
          <Controller
            name="misQfTableId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 200 }}
                error={!!errors.misQfTableId}
              >
                <InputLabel shrink={!!value}>Table</InputLabel>
                <Select
                  displayEmpty
                  notched={!!value}
                  renderValue={(newVal) =>
                    tableList?.find((item) => item.key === newVal)?.value ??
                    tableList?.find((item) => item.key === queryFormDetail?.misQfTableId)?.value
                  }
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? queryFormDetail?.misQfTableId}
                  defaultValue={queryFormDetail?.misQfTableId ?? ''}
                  onChange={(e) => {
                    refreshCrossRef(e.target.value, -1);
                    onChange(e);
                  }}
                  disabled={!!paramId}
                >
                  {tableList?.map((item) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>{errors?.misQfTableId?.message as string}</FormHelperText>
              </FormControl>
            )}
          />
          {crossRef.map((ref, index) => (
            <Controller
              key={ref.id}
              name={`crossRef.${index}.misQfTableId`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  variant="standard"
                  sx={{ m: 1, minWidth: 200 }}
                  error={!!errors?.crossRef?.[index]?.misQfTableId}
                >
                  <InputLabel shrink={!!value}>Table</InputLabel>
                  <Select
                    displayEmpty
                    notched={!!value}
                    renderValue={(newVal) =>
                      tableList?.find((item) => item.key === newVal)?.value ??
                      tableList?.find((item) => item.key === ref?.misQfTableId)?.value
                    }
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value /**?? crossRef?.[index]?.misQfTableId */}
                    defaultValue={/*crossRef?.[index]?.misQfTableId ?? */ ''}
                    onChange={(e) => {
                      refreshCrossRef(e.target.value, index);
                      onChange(e);
                    }}
                    // disabled={!!paramId}
                  >
                    {crossRefOption?.[index]?.map((i) => {
                      return (
                        <MenuItem key={i.key} value={i.key}>
                          {i.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => deleteCrossRef(index)}
                    sx={{ position: 'absolute', right: '0' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                  <FormHelperText>
                    {errors?.crossRef?.[index]?.misQfTableId?.message as string}
                  </FormHelperText>
                </FormControl>
              )}
            />
          ))}
          <IconButton
            color="primary"
            size="small"
            onClick={addCrossRef}
            disabled={
              !!!misQfTableId /*未选择root table*/ ||
              crossRef.length >= 5 /*未选择 cross ref 长度不能大于5*/ ||
              (!!misQfTableId &&
                !!!crossRef?.[crossRef.length - 1]?.misQfTableId &&
                crossRef.length > 0) /**选择了root table && 未选择最后一个crossref下拉选项 */
            }
          >
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2} mb={3}>
          <FormControl error={!!errors.qfColumns}>
            <FormLabel component="legend">
              {getTableNameById(misQfTableId) + ' '}Show Items
            </FormLabel>
            <div>
              {showItems?.map((option: any, i) => {
                return (
                  i < 5 && (
                    <FormControlLabel
                      sx={{ m: 1 }}
                      control={
                        <Controller
                          name="qfColumns"
                          render={({ field: { onChange, value } }) => {
                            return (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onChange={() => onChange(handleSelect(option.key, value))}
                                    checked={
                                      !!getValues('qfColumns')?.find(
                                        (item) => item?.misQfcColumnId === option.key
                                      )
                                    }
                                  />
                                }
                                label={option.value}
                              />
                            );
                          }}
                          control={control}
                        />
                      }
                      label={option.label}
                      key={option.value}
                    />
                  )
                );
              })}
              {(showItems?.length ?? 0) > 5 && (
                <Button
                  endIcon={<MoreHorizIcon />}
                  onClick={() => {
                    setDialogUpdateFn({
                      update: (c: QfColumns[]) => {
                        setValue('qfColumns', c);
                        trigger('qfColumns');
                      },
                    });
                    setDialogShowItems(showItems);
                    setDialogCheckItems(getValues('qfColumns'));
                    setOpenShowMore(true);
                  }}
                >
                  show more
                </Button>
              )}
            </div>

            <FormHelperText>{errors?.qfColumns?.message as string}</FormHelperText>
          </FormControl>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() =>
            append({
              misQfc2ColumnId: '',
              misQfc2Condition: '',
              misQfc2Value: '',
              misRelation: '',
            })
          }
        >
          Add Condition
        </Button>

        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <Stack direction="row" spacing={2} mb={3} key={field.id}>
                {index !== 0 && (
                  <Controller
                    name={`qfConditions.${index}.misRelation`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControl
                        error={!!errors.qfConditions?.[index]?.misRelation}
                        sx={{ m: 1, width: 150 }}
                      >
                        <RadioGroup
                          row
                          aria-labelledby="demo-row-radio-buttons-group-label"
                          name="row-radio-buttons-group"
                          value={value}
                          onChange={onChange}
                        >
                          <FormControlLabel value="and" control={<Radio />} label="And" />
                          <FormControlLabel value="or" control={<Radio />} label="Or" />
                        </RadioGroup>
                        <FormHelperText>
                          {errors?.qfConditions?.[index]?.misRelation?.message as string}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                )}

                {index === 0 && <FormControl sx={{ m: 1, width: 150 }}></FormControl>}

                <Controller
                  name={`qfConditions.${index}.misQfc2ColumnId`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      //focused={!!paramId}
                      variant="standard"
                      sx={{ m: 1, minWidth: 200 }}
                      error={!!errors.qfConditions?.[index]?.misQfc2ColumnId}
                    >
                      <InputLabel id="demo-simple-select-standard-label">Column Name</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        renderValue={(newVal) =>
                          columnList?.find((item) => item.key === newVal)?.value
                        }
                        value={value ?? `qfConditions.${index}.misQfc2ColumnId`}
                        defaultValue={`qfConditions.${index}.misQfc2ColumnId` ?? ''}
                        onChange={onChange}
                      >
                        {columnList?.map((item) => {
                          return (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      <FormHelperText>
                        {errors?.qfConditions?.[index]?.misQfc2ColumnId?.message as string}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name={`qfConditions.${index}.misQfc2Condition`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      //focused={!!paramId}
                      variant="standard"
                      sx={{ m: 1, minWidth: 200 }}
                      error={!!errors.qfConditions?.[index]?.misQfc2Condition}
                    >
                      <InputLabel id="demo-simple-select-standard-label">Condition</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        renderValue={(newVal) =>
                          ConditionArr?.find((item) => item.key === newVal)?.value ??
                          ConditionArr?.find(
                            (item) => item.key === `qfConditions.${index}.misQfc2Condition`
                          )?.value
                        }
                        value={value ?? `qfConditions.${index}.misQfc2Condition`}
                        defaultValue={`qfConditions.${index}.misQfc2Condition` ?? ''}
                        onChange={onChange}
                      >
                        {ConditionArr?.map((item) => {
                          return (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      <FormHelperText>
                        {errors?.qfConditions?.[index]?.misQfc2ColumnId?.message as string}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name={`qfConditions.${index}.misQfc2Value`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      //focused={!!paramId}
                      id="standard-basic"
                      variant="standard"
                      error={!!errors.qfConditions?.[index]?.misQfc2Value}
                      onChange={onChange}
                      defaultValue={field.misQfc2Value}
                      value={value}
                      label="Value"
                      helperText={errors?.qfConditions?.[index]?.misQfc2Value?.message as string}
                    />
                  )}
                />
                {index !== 0 && (
                  <IconButton aria-label="delete" size="large" onClick={() => remove(index)}>
                    <ClearIcon fontSize="inherit" />
                  </IconButton>
                )}
              </Stack>
            </div>
          );
        })}

        {crossRef.map((ref, index) => {
          return (
            <div
              style={{ borderTop: '1px solid #a99d9d', marginTop: '5px', paddingTop: '5px' }}
              key={ref.id + 'crossRef'}
            >
              <Stack direction="row" spacing={2} mb={3}>
                <FormControl error={!!errors?.crossRef?.[index]?.qfColumns}>
                  <FormLabel component="legend">
                    {getTableNameById(ref.misQfTableId) + ' '} Show Items{' '}
                  </FormLabel>
                  <div>
                    {crossRefShowItems?.[index]?.map((option: any, i) => {
                      return (
                        i < 5 && (
                          <FormControlLabel
                            sx={{ m: 1 }}
                            control={
                              <Controller
                                name={`crossRef.${index}.qfColumns`}
                                render={({ field: { onChange, value } }) => {
                                  return (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          onChange={() => onChange(handleSelect(option.key, value))}
                                          checked={
                                            !!getValues(`crossRef.${index}.qfColumns`)?.find(
                                              (item) => item?.misQfcColumnId === option.key
                                            )
                                          }
                                        />
                                      }
                                      label={option.value}
                                    />
                                  );
                                }}
                                control={control}
                              />
                            }
                            label={option.label}
                            key={option.value}
                          />
                        )
                      );
                    })}
                    {(crossRefShowItems?.[index]?.length ?? 0) > 5 && (
                      <Button
                        endIcon={<MoreHorizIcon />}
                        onClick={() => {
                          setDialogUpdateFn({
                            update: (c: QfColumns[]) => {
                              setValue(`crossRef.${index}.qfColumns`, c);
                              trigger(`crossRef.${index}.qfColumns`);
                            },
                          });
                          setDialogShowItems(crossRefShowItems?.[index]);
                          setDialogCheckItems(getValues(`crossRef.${index}.qfColumns`));
                          setOpenShowMore(true);
                        }}
                      >
                        show more
                      </Button>
                    )}
                  </div>
                  <FormHelperText>
                    {errors?.crossRef?.[index]?.qfColumns?.message as string}
                  </FormHelperText>
                </FormControl>
              </Stack>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => {
                  addEmptyCrossRefQfConditions(index);
                }}
              >
                Add Condition
              </Button>
              {ref.qfConditions?.map((conditions, cIndex) => {
                return (
                  <Stack direction="row" spacing={2} mb={3} key={ref.id + 'crossRefqfc'}>
                    {cIndex !== 0 && (
                      <Controller
                        name={`crossRef.${index}.qfConditions.${cIndex}.misRelation`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misRelation}
                            sx={{ m: 1, width: 150 }}
                          >
                            <RadioGroup
                              row
                              aria-labelledby="demo-row-radio-buttons-group-label"
                              name="row-radio-buttons-group"
                              value={value}
                              onChange={onChange}
                            >
                              <FormControlLabel value="and" control={<Radio />} label="And" />
                              <FormControlLabel value="or" control={<Radio />} label="Or" />
                            </RadioGroup>
                            <FormHelperText>
                              {
                                errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misRelation
                                  ?.message as string
                              }
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    )}

                    {
                      cIndex === 0 && (
                        <FormControl sx={{ m: 1, width: 150 }}></FormControl>
                      ) /**空块 */
                    }

                    <Controller
                      name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2ColumnId`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          //focused={!!paramId}
                          variant="standard"
                          sx={{ m: 1, minWidth: 200 }}
                          error={
                            !!errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2ColumnId
                          }
                        >
                          <InputLabel id="demo-simple-select-standard-label">
                            Column Name
                          </InputLabel>
                          <Select
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            renderValue={(newVal) =>
                              crossRefColumnList[index]?.find((item) => item.key === newVal)?.value
                            }
                            value={value /**?? `qfConditions.${index}.misQfc2ColumnId` */}
                            defaultValue={/**`qfConditions.${index}.misQfc2ColumnId` ?? */ ''}
                            onChange={onChange}
                          >
                            {crossRefColumnList[index]?.map((item) => {
                              return (
                                <MenuItem key={item.key} value={item.key}>
                                  {item.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <FormHelperText>
                            {
                              errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2ColumnId
                                ?.message as string
                            }
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Condition`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          //focused={!!paramId}
                          variant="standard"
                          sx={{ m: 1, minWidth: 200 }}
                          error={
                            !!errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Condition
                          }
                        >
                          <InputLabel id="demo-simple-select-standard-label">Condition</InputLabel>
                          <Select
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            /**
                              renderValue={(newVal) =>
                                ConditionArr?.find((item) => item.key === newVal)?.value ??
                                ConditionArr?.find(
                                  (item) => item.key === `qfConditions.${index}.misQfc2Condition`
                                )?.value
                              } */
                            value={value /**?? `qfConditions.${index}.misQfc2Condition` */}
                            defaultValue={/**`qfConditions.${index}.misQfc2Condition` ?? */ ''}
                            onChange={onChange}
                          >
                            {ConditionArr?.map((item) => {
                              return (
                                <MenuItem key={item.key} value={item.key}>
                                  {item.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <FormHelperText>
                            {
                              errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Condition
                                ?.message as string
                            }
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Value`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          //focused={!!paramId}
                          id="standard-basic"
                          variant="standard"
                          // error={!!errors.qfConditions?.[index]?.misQfc2Value}
                          error={!!errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Value}
                          onChange={onChange}
                          /*defaultValue={field.misQfc2Value}*/
                          value={value}
                          label="Value"
                          helperText={
                            errors.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Value
                              ?.message as string
                          }
                        />
                      )}
                    />
                    {cIndex !== 0 && (
                      <IconButton
                        aria-label="delete"
                        size="large"
                        onClick={() => removeCrossRefQfConditions(index, cIndex)}
                      >
                        <ClearIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
            </div>
          );
        })}

        <Stack direction="row" spacing={2} mb={3} mt={3}>
          <Button disableElevation variant="contained" sx={{}} startIcon={<FaSave />} type="submit">
            Save
          </Button>
          <Button
            disableElevation
            variant="outlined"
            sx={{}}
            type="submit"
            onClick={() => history.goBack()}
          >
            Cancel
          </Button>
        </Stack>
      </form>
      <Dialog open={openShowMore} fullWidth>
        <DialogTitle>Column Config</DialogTitle>
        <DialogContent
        // sx={{
        //   display: 'flex',
        //   justifyContent: 'space-between',
        //   flexWrap: 'wrap',
        //   paddingX: 6,
        // }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpenShowMore(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Stack direction="row" flexWrap="wrap">
            {/* <FormGroup> */}
            {dialogShowItems?.map((option: QueryTableDetail, i) => {
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => {
                        const result = e.target.checked
                          ? [
                              ...(dialogCheckItems ?? []),
                              { misQfId: '', misQfcColumnId: option.key, misQfcId: '' },
                            ]
                          : [
                              ...(dialogCheckItems ?? []).filter(
                                (item) => item.misQfcColumnId !== option.key
                              ),
                            ];
                        dialogUpdateFn?.update(result);
                        setDialogCheckItems(result);
                      }}
                      checked={!!dialogCheckItems?.find((i) => i.misQfcColumnId === option.key)}
                    />
                  }
                  label={option.value}
                  key={option.value}
                />
              );
            })}
            {/* </FormGroup> */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <FormControlLabel
            control={
              <Checkbox
                onChange={(e) => {
                  const result = e.target.checked
                    ? [
                        ...(dialogShowItems?.map((i) => {
                          return { misQfId: '', misQfcColumnId: i.key, misQfcId: '' };
                        }) ?? []),
                      ]
                    : [];
                  dialogUpdateFn?.update(result);
                  setDialogCheckItems(result);
                }}
                checked={dialogCheckItems?.length == dialogShowItems?.length}
              />
            }
            label={'SELECT ALL'}
          />
          <Button
            variant="contained"
            type="submit"
            onClick={() => {
              setOpenShowMore(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QueryFormDetailPage;
