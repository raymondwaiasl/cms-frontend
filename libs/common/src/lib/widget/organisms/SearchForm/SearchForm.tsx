import {
  DicItem,
  QfColumns,
  QueryFormDetail,
  QueryFormDetailCrossRef,
  QueryTableDetail,
  SaveSearchFormInput,
} from '../../../api';
import { ConditionArr, DefaultFolderId } from '../../../constant';
import { useApi, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import btnStyle from '../../../style/btnStyle';
import CrossRef from './CrossRef';
import { yupResolver } from '@hookform/resolvers/yup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
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
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
// import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { ValidationError } from 'yup';

// const handleSelect = (columnId: any, arr?: QfColumns[]) => {
//   if (arr) {
//     return arr.find((item) => item.misQfcColumnId === columnId)
//       ? arr.filter((item) => item.misQfcColumnId !== columnId)
//       : [...arr, { misQfId: '', misQfcColumnId: columnId, misQfcId: '' }];
//   }
//   return;
// };

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

const SearchForm = () => {
  const queryClient = useQueryClient();
  const { closeCurrentOverlay } = useOverlay('Search Form');
  const { data, updateWidget, dataStore, setData } = useWidget<{ id: string; folderId?: string }>(
    'Search Form'
  );
  const [qfId, setQfId] = useState<string>('');
  // const { search, pathname } = useLocation();
  const [columnList, setColumnList] = useState<QueryTableDetail[]>();
  const [showItems, setShowItems] = useState<QueryTableDetail[]>();
  type updateFormQfColumnsFn = {
    update: (c: QfColumns[]) => void;
  };
  const [queryFormDetail, setQueryFormDetail] = useState<QueryFormDetail>();
  const client = useApi();

  const folderId = useMemo(
    () => data?.folderId ?? DefaultFolderId,
    [data?.folderId, DefaultFolderId]
  );

  const [sortModel, setSortModel] = useState({ field: '', sort: '' });
  const {
    handleSubmit,
    reset,
    formState,
    getValues,
    control,
    watch,
    setValue,
    trigger,
    ...others
  } = useForm<Omit<SaveSearchFormInput, 'misQfGroupId' | 'misQfPublic'>>({
    resolver: yupResolver(schema),
    defaultValues: {
      misQfName: queryFormDetail?.misQfName,
      misQfTableId: queryFormDetail?.misQfTableId,
      qfConditions: queryFormDetail?.qfConditions,
      qfColumns: queryFormDetail?.qfColumns ?? [],
      crossRef: queryFormDetail?.crossRef ?? [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    name: 'qfConditions',
    control,
  });
  const {
    fields: crossRef,
    append: appendCrossRef,
    remove: removeCrossRef,
    update: updateCrossRef,
    replace: replaceCrossRef,
  } = useFieldArray({
    name: 'crossRef',
    control,
  });

  const [crossRefColumnList, setCrossRefColumnList] = useState<{
    [key: string]: QueryTableDetail[];
  }>({});
  const [crossRefOption, setCrossRefOption] = useState<DicItem[][]>([]);
  const [crossRefShowItems, setCrossRefShowItems] = useState<{ [key: string]: QueryTableDetail[] }>(
    {}
  );
  const [openShowMore, setOpenShowMore] = useState(false);
  const [dialogShowItems, setDialogShowItems] = useState<QueryTableDetail[]>();
  const [dialogCheckItems, setDialogCheckItems] = useState<QfColumns[]>();
  const [dialogUpdateFn, setDialogUpdateFn] = useState<updateFormQfColumnsFn>();

  // const handleSortChange = (newSortModel: any) => {
  //   if (JSON.stringify(sortModel) !== JSON.stringify(newSortModel[0])) {
  //     if (newSortModel.length > 0) {
  //       setSortModel((old) => ({
  //         ...old,
  //         field: newSortModel[0].field,
  //         sort: newSortModel[0].sort,
  //       }));
  //     }
  //   }
  // };

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 20,
  });

  const { data: pageData } = useQuery(['My Search', pageState, sortModel], async () => {
    const { data: response } = await client.queryForm.getQueryFormPageable({
      pageState,
      sortModel,
    });
    return response;
  });

  useQuery(
    ['Search Form', qfId],
    async () => {
      return (await client.queryForm.getQueryFormById({ id: qfId ?? '' })).data;
    },
    {
      enabled: !!qfId,
      onSuccess: (data) => {
        reset({
          //   misQfName: data?.misQfName,
          misQfTableId: data?.misQfTableId,
          qfConditions: data?.qfConditions,
          qfColumns: data?.qfColumns,
          crossRef: data?.crossRef,
        });
        //
        if (data?.crossRef?.length || 0 > 0) {
          refreshRefColumnList(data.crossRef);
        }
      },
    }
  );

  const refreshRefColumnList = async (crossRef: QueryFormDetailCrossRef[] | undefined) => {
    // setCrossRefColumnList(new Map());
    // setCrossRefShowItems(new Map());
    if (!crossRef || !crossRef.length) {
      return;
    }
    client.typeRefService
      .getCrossRefById({ id: crossRef.map((i) => i.misQfTableId).join(',') })
      .then((result) => {
        if (result.data.length > 0) {
          setCrossRefOption([[...result.data]]);
        } else {
          toast('No cross references found', {
            type: 'info',
          });
        }
      });
    // const tmpTableIds: string[] = [];
    // tmpTableIds.push(getValues('misQfTableId'));
    Promise.all(
      crossRef.map((r, i) => {
        // const tableIds = tmpTableIds.join();
        //2.增加cross ref option

        client.queryForm
          .getColumnDic({
            id: r.misQfTableId,
            // allowSearch:'Y',
          })
          .then((result) => {
            const array: QueryTableDetail[] = result.data;
            setCrossRefShowItems((prev) => ({ ...prev, [r.misQfTableId]: array }));
            setCrossRefColumnList((prev) => ({
              ...prev,
              [r.misQfTableId]: array.filter((detail) => detail?.allowSearch == 'Y'),
            }));
          })
          .catch((e) => {
            toast('query column fail' + e.message, {
              type: 'info',
            });
          });
        // tmpTableIds.push(r.misQfTableId);
      })
    );
    setValue('crossRef', crossRef);
  };

  const SaveSearchForm = useMutation(client.queryForm.saveSearchForm, {
    onSuccess: () => {
      //   setQfId(data.data.id);
      queryClient.invalidateQueries('My Search');
      toast.success('Saved Successfully');
    },
  });
  const [tableList, setTableList] = useState<QueryTableDetail[]>();
  const getTableListOnPage = async () => {
    const { data: response } = await client.queryForm.getTypeDic();
    setTableList(response);
    updateWidget('Search Form', { getFormValues: (name: any) => getValues(name) });
  };
  useEffect(() => {
    getTableListOnPage();
  }, []);

  // getTableListOnPage();
  // const getTableNameById = (tableId: string | undefined): string => {
  //   return tableList?.find((item) => item.key === tableId)?.value ?? '';
  // };
  useQuery(
    ['ColumnDic', watch('misQfTableId')],
    async () => {
      return (
        await client.queryForm.getColumnDic({
          id: watch('misQfTableId') ?? '',
          // allowSearch:'Y',
        })
      ).data;
    },
    {
      enabled: !!watch('misQfTableId'),
      onSuccess: (data) => {
        const array: QueryTableDetail[] = data;
        setShowItems(array);
        setColumnList(array.filter((detail) => detail?.allowSearch == 'Y'));
        // console.log(searchFormData?.crossRef);
        // if (searchFormData?.crossRef?.length || 0 > 0) {
        //   refreshRefColumnList(searchFormData?.crossRef);
        // }
      },
    }
  );

  useEffect(() => {
    if (data?.id) {
      setQfId(data.id);
    }
  }, [data]);
  // useEffect(() => {
  //   if (search) {
  //     const prevValues = { ...getValues() };
  //     const query = qs.parse(search) as any;
  //     if (query.searchForm) {
  //       console.log(JSON.parse(query.searchForm));
  //       const { qfId, ...queryData } = JSON.parse(query.searchForm);
  //       setQfId(qfId);
  //       reset({ ...prevValues, ...queryData });
  //     }
  //   }
  // }, [search]);
  // const removeCrossRefQfConditions = (pos: number, i: number) => {
  //   // crossRef[pos].qfConditions = [...(crossRef[pos]?.qfConditions ?? [])]; //不加上这行代码,search 后再次新增空条件时会报错
  //   // crossRef[pos]?.qfConditions?.splice(i, 1);
  //   updateCrossRef(pos, crossRef[pos]);
  // };
  // const addEmptyCrossRefQfConditions = (pos: number) => {
  //   crossRef[pos].qfConditions = [...(crossRef[pos]?.qfConditions ?? [])];
  //   crossRef[pos]?.qfConditions?.push({
  //     misQfc2ColumnId: '',
  //     misQfc2Condition: '',
  //     misQfc2Value: '',
  //     misRelation: '',
  //   });
  //   updateCrossRef(pos, crossRef[pos]);
  // };

  const addCrossRef = async () => {
    const tableIds = [
      ...getValues('crossRef').map((r) => r.misQfTableId),
      getValues('misQfTableId'),
    ].join();
    console.log(tableIds);
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

        console.log(crossRefOption);
        setCrossRefOption([...crossRefOption, result.data]);
      } else {
        toast('No cross references found', {
          type: 'info',
        });
      }
    });
  };

  const refreshCrossRef = async (pos: number, tableId?: string) => {
    console.log(tableId, 'running');
    if (!tableId) {
      return;
    }
    console.log('running');
    console.log(getValues('crossRef'));
    // setCrossRefColumnList(new Map());
    // setCrossRefShowItems(new Map());
    // crossRef[pos].misQfTableId = tableId;
    // crossRef[pos].qfColumns = [];
    // updateCrossRef(pos, crossRef[pos]);
    // setValue('crossRef',crossRef.slice(0,pos + 1));
    // removeAfterCrossRef(pos + 1);
    // setCrossRefOption([...crossRefOption.slice(0, pos + 1)]);
    const { data: columns } = await client.queryForm.getColumnDic({
      id: tableId,
      // allowSearch:'Y',
    });
    console.log(columns);
    const array: QueryTableDetail[] = columns;
    // setCrossRefOption(prev => {
    //   prev[pos] = array
    //   console.log(prev)
    //   return prev
    // })

    setCrossRefColumnList((prev) => ({ ...prev, [tableId]: array }));
    setCrossRefShowItems((prev) => ({
      ...prev,
      [tableId]: array.filter((detail) => detail?.allowSearch == 'Y'),
    }));
  };

  // const removeAfterCrossRef = (pos: number) => {
  //   var tail = crossRef.length - 1;
  //   if (tail == -1) return;
  //   while (tail >= pos) {
  //     removeCrossRef(tail--);
  //   }
  // };

  // const deleteCrossRef = (pos: number) => {
  //   // deleteCrossRef;
  //   // removeAfterCrossRef(pos);
  //   // setCrossRefOption([...crossRefOption.slice(0, pos)]);
  // };

  // const handleSelect = (columnId: any, arr?: QfColumns[]) => {
  //   if (arr) {
  //     const selectColumns = arr.find((item) => item.misQfcColumnId === columnId)
  //       ? [...arr.filter((item) => item.misQfcColumnId !== columnId)]
  //       : [...arr, { misQfId: '', misQfcColumnId: columnId, misQfcId: '' }];
  //     return selectColumns;
  //   }
  //   return;
  // };

  // const handleCrossRefSelect = (pos: number, columnId: any, arr?: QfColumns[]) => {
  //   if (arr) {
  //     crossRef[pos].qfColumns = arr.find((item) => item.misQfcColumnId === columnId)
  //       ? [...arr.filter((item) => item.misQfcColumnId !== columnId)]
  //       : [...arr, { misQfId: '', misQfcColumnId: columnId, misQfcId: '' }];
  //     updateCrossRef(pos, crossRef[pos]);
  //     return crossRef[pos].qfColumns;
  //   }
  //   return;
  // };

  const { data: defaultFolderId } = useQuery('defaultFolderId', async () => {
    return (await client.folderService.getDefaultFolder()).data.misFolderId;
  });

  return (
    <FormProvider
      {...{
        handleSubmit,
        reset,
        formState,
        getValues,
        control,
        watch,
        setValue,
        trigger,
        ...others,
      }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'white',
          padding: '10px',
          // overflowX: 'auto',
          // overflowY: 'auto',
          borderRadius: '12px',
        }}
        component="form"
        onSubmit={handleSubmit(
          (data) => {
            SaveSearchForm.mutate({
              ...data,
              misQfPublic: '1',
              misQfGroupId: '',
            });
          },
          (error) => {
            console.log(error);
          }
        )}
      >
        <Box sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'end' }}>
          <Button
            {...btnStyle.primary}
            aria-label="add"
            disabled={!qfId || !folderId}
            onClick={() => {
              // const searchParmas=
              const searchParams = {
                typeId: getValues('misQfTableId'),
                qfColumns: getValues('qfColumns'),
                qfConditions: getValues('qfConditions'),
                crossRef: getValues('crossRef'),
                folderId: folderId,
              };
              updateWidget('Record List', {
                searchParams,
                tab: 1,
              });
              if (
                dataStore &&
                JSON.stringify(dataStore['Record List'].searchParams) ===
                  JSON.stringify(searchParams)
              ) {
                queryClient.invalidateQueries('Search table');
              }
              replace([...getValues('qfConditions')]);
              replaceCrossRef([...getValues('crossRef')]);
              closeCurrentOverlay();
            }}
          >
            <AiOutlineSearch size={20} style={{ marginRight: '8px' }} />
            Search
          </Button>
          {dataStore && dataStore['Record List'].searchParams && (
            <Button
              {...btnStyle['danger-outlined']}
              aria-label="add"
              disabled={!qfId || !folderId}
              onClick={() => {
                // const searchParmas=
                updateWidget('Record List', {
                  searchParams: null,
                });
                closeCurrentOverlay();
              }}
            >
              <AiOutlineClose size={20} style={{ marginRight: '8px' }} />
              Clear
            </Button>
          )}
        </Box>
        <Grid container xs={6} md={12} alignItems={'center'} sx={{ marginBottom: 2 }}>
          <Grid item>
            <FormControl
              sx={{
                marginBottom: 2,
                minWidth: '150px',
                marginRight: (prop) => prop.breakpoints.values.md && 2,
              }}
            >
              <InputLabel>My searches</InputLabel>
              <Select
                value={qfId}
                onChange={(evt) => {
                  // setQfId(evt.target.value);
                  setData({ id: evt.target.value });
                }}
                displayEmpty
                renderValue={(value) => {
                  return pageData?.data.find((item: any) => item.misQfId === (value || qfId))
                    ?.misQfName;
                }}
                id="my searches"
                label="My searches"
                autoWidth
                variant="standard"
              >
                {pageData?.data.map((item: any) => (
                  <MenuItem key={item.misQfId} value={item.misQfId}>
                    {item.misQfName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Controller
              name="misQfName"
              control={control}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    label="Save Search Name"
                    variant="standard"
                    error={!!formState.errors?.misQfName}
                    sx={{
                      marginBottom: 2,
                      marginRight: 2,
                    }}
                  />
                  <FormHelperText error={!!formState.errors?.misQfName}>
                    {formState.errors?.misQfName?.message as string}
                  </FormHelperText>
                </>
              )}
            />
          </Grid>
          {/* <Grid item>
            <Button type="submit" variant="contained" startIcon={<FaSave />}>
              Save Search
            </Button>
            <Button
              sx={{ marginLeft: 2 }}
              type="button"
              variant="contained"
              onClick={() => {
                const query = { searchForm: JSON.stringify({ ...getValues(), qfId }) };
                console.log(query);
                navigator.clipboard.writeText('?' + qs.stringify(query));
              }}
              startIcon={<FaCopy />}
            >
              Copy Search
            </Button>
          </Grid> */}
        </Grid>
        {!!qfId ? (
          <>
            <TextField
              label="Table"
              disabled
              value={pageData?.data.find((item: any) => item.misQfId === qfId)?.tableLabel ?? ''}
            />

            <FormControl error={!!formState.errors?.qfColumns}>
              <FormLabel component="legend">Show Items</FormLabel>
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
                                      onChange={(_, isSelect) => {
                                        onChange(
                                          isSelect
                                            ? [
                                                ...value,
                                                {
                                                  misQfId: '',
                                                  misQfcColumnId: option.key,
                                                  misQfcId: '',
                                                },
                                              ]
                                            : [
                                                ...value.filter(
                                                  (item) => item.misQfcColumnId !== option.key
                                                ),
                                              ]
                                        );
                                        trigger('qfColumns');
                                      }}
                                      checked={
                                        !!value.find((item) => item?.misQfcColumnId === option.key)
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

              <FormHelperText>{formState.errors?.qfColumns?.message as string}</FormHelperText>
            </FormControl>
            <div
              style={{
                borderTop: '1px solid #eaeaea',
                paddingTop: '16px',
                marginBottom: '16px',
              }}
            >
              {fields.map((field, index) => {
                return (
                  <Stack
                    key={field.id}
                    direction="row"
                    mb={3}
                    flexWrap="wrap"
                    justifyContent={'start'}
                    alignItems={'center'}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      padding: '20px',
                      borderRadius: '20px',
                      backgroundColor: index % 2 !== 0 ? '#F3F6F5' : undefined,
                    }}
                  >
                    {index !== 0 && (
                      <Controller
                        name={`qfConditions.${index}.misRelation`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!formState.errors.qfConditions?.[index]?.misRelation}
                            sx={{ m: 1, width: '100%' }}
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
                                formState.errors?.qfConditions?.[index]?.misRelation
                                  ?.message as string
                              }
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    )}

                    <Controller
                      name={`qfConditions.${index}.misQfc2ColumnId`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          //focused={!!paramId}
                          variant="standard"
                          sx={{
                            marginBottom: {
                              xs: 1, // theme.breakpoints.up('xs')
                              sm: 1, // theme.breakpoints.up('sm')
                              md: 0, // theme.breakpoints.up('md')
                              lg: 0, // theme.breakpoints.up('lg')
                              xl: 0, // theme.breakpoints.up('xl')
                            },
                            marginRight: {
                              xs: 0, // theme.breakpoints.up('xs')
                              sm: 0, // theme.breakpoints.up('sm')
                              md: 2, // theme.breakpoints.up('md')
                              lg: 2, // theme.breakpoints.up('lg')
                              xl: 2, // theme.breakpoints.up('xl')
                            },
                            minWidth: 200,
                          }}
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2ColumnId}
                        >
                          <InputLabel id="demo-simple-select-standard-label">
                            Column Name
                          </InputLabel>
                          <Select
                            autoWidth
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            renderValue={(newVal) =>
                              columnList?.find((item) => item.key === newVal)?.value ??
                              columnList?.find(
                                (item) => item.key === `qfConditions.${index}.misQfc2ColumnId`
                              )?.value
                            }
                            value={value}
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
                            {
                              formState.errors?.qfConditions?.[index]?.misQfc2ColumnId
                                ?.message as string
                            }
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
                          sx={{
                            marginBottom: {
                              xs: 1, // theme.breakpoints.up('xs')
                              sm: 1, // theme.breakpoints.up('sm')
                              md: 0, // theme.breakpoints.up('md')
                              lg: 0, // theme.breakpoints.up('lg')
                              xl: 0, // theme.breakpoints.up('xl')
                            },
                            marginRight: {
                              xs: 0, // theme.breakpoints.up('xs')
                              sm: 0, // theme.breakpoints.up('sm')
                              md: 2, // theme.breakpoints.up('md')
                              lg: 2, // theme.breakpoints.up('lg')
                              xl: 2, // theme.breakpoints.up('xl')
                            },
                            minWidth: 200,
                          }}
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2Condition}
                        >
                          <InputLabel id="demo-simple-select-standard-label">Condition</InputLabel>
                          <Select
                            autoWidth
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            renderValue={(newVal) =>
                              ConditionArr?.find((item) => item.key === newVal)?.value
                            }
                            value={value}
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
                              formState.errors?.qfConditions?.[index]?.misQfc2ColumnId
                                ?.message as string
                            }
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
                          sx={{
                            minWidth: 200,
                            marginBottom: {
                              xs: 2,
                              sm: 2,
                              md: 0,
                              lg: 0,
                              xl: 0,
                            },
                          }}
                          id="standard-basic"
                          variant="standard"
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2Value}
                          onChange={onChange}
                          value={value}
                          label="Value"
                          helperText={
                            formState.errors?.qfConditions?.[index]?.misQfc2Value?.message as string
                          }
                        />
                      )}
                    />
                    {index !== 0 && (
                      <IconButton
                        color="error"
                        onClick={() => remove(index)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
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
            </div>
            {crossRef.map((ref, index) => {
              return (
                <CrossRef
                  key={ref.id}
                  index={index}
                  crossRefOption={crossRefOption[index] || []}
                  tableList={tableList || []}
                  crossRefShowItems={
                    crossRefShowItems[getValues(`crossRef.${index}.misQfTableId`)] ?? []
                  }
                  crossRefColumnList={
                    crossRefColumnList[getValues(`crossRef.${index}.misQfTableId`)] || []
                  }
                  onTableChange={(crossRefTableId, crossRefIndex) => {
                    refreshCrossRef(crossRefIndex, crossRefTableId);
                  }}
                  onDialogOpen={() => {
                    setDialogUpdateFn({
                      update: (c: QfColumns[]) => {
                        setValue(`crossRef.${index}.qfColumns`, [...c]);
                        trigger(`crossRef.${index}.qfColumns`);
                      },
                    });
                    setDialogShowItems(
                      crossRefShowItems[getValues(`crossRef.${index}.misQfTableId`)]
                    );
                    setDialogCheckItems(getValues(`crossRef.${index}.qfColumns`));
                    setOpenShowMore(true);
                  }}
                  onCrossRefRemove={(index) => removeCrossRef(index)}
                />
              );
            })}

            <div
              style={{
                borderTop: '1px solid #eaeaea',
                paddingTop: '16px',
                marginTop: '16px',
              }}
            ></div>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => addCrossRef()}
              // size="small"
              // sx={{padding:0}}
              disabled={
                crossRef.length >= 5 /*未选择 cross ref 长度不能大于5*/ ||
                (!getValues(`crossRef.${crossRef.length - 1}.misQfTableId`) &&
                  crossRef.length > 0) /**未选择最后一个crossref下拉选项 */
              }
            >
              Add Cross Reference
            </Button>
          </>
        ) : (
          <div>Please select a new Search Form</div>
        )}

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
      </Box>
    </FormProvider>
  );
};

export default SearchForm;
