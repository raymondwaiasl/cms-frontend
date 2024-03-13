import {
  DemoInputHandling,
  InputHandling,
} from '../../../../../libs/common/src/lib/utils/searchItemHandling';
import FormContainer from './FormContainer';
import styles from './SimpleSearch.module.scss';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import PreviewIcon from '@mui/icons-material/Preview';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Slider,
  Card,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import cn from 'clsx';
import { getRandomValues } from 'crypto';
import { SimpleSearchItem, WidgetItem } from 'libs/common/src/lib/api';
import { GraphicsTypeData } from 'libs/common/src/lib/constant';
import { simpleSearchItemType } from 'libs/common/src/lib/constant';
import { Widget } from 'libs/common/src/lib/context';
import { useApi } from 'libs/common/src/lib/hooks';
import configStore from 'libs/common/src/lib/store/configStore';
import GridWrapper from 'libs/common/src/lib/widget/organisms/GridWrapper/GridWrapper';
import { nanoid } from 'nanoid';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineEye } from 'react-icons/ai';
import { CgCloseR } from 'react-icons/cg';
import { MdAdd } from 'react-icons/md';
import { RiSave3Fill } from 'react-icons/ri';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRecoilState } from 'recoil';

const EditSimpleSearch = () => {
  const typeList: any[] = [
    { key: '2', value: '10%' },
    { key: '4', value: '20%' },
    { key: 0.3, value: '30%' },
    { key: 0.4, value: '40%' },
    { key: 0.5, value: '50%' },
    { key: 0.6, value: '60%' },
  ];

  const client = useApi();
  const history = useHistory();
  const queryClient = useQueryClient();
  const id = useMemo(() => new URLSearchParams(location.search).get('id'), [location.search]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [includeList, setIncludeList] = useState<SimpleSearchItem[]>([]);
  const [activeProperties, setActiveProperties] = useState<SimpleSearchItem | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (titleRef.current?.offsetHeight) {
      setOffset((titleRef.current?.offsetHeight ?? 0) + 10);
    }
    if (titleRef.current?.offsetHeight) {
      setWidth(titleRef.current?.offsetWidth ?? 0);
    }
  }, [titleRef.current?.offsetHeight, titleRef.current?.offsetWidth]);

  const [currentWidth, setCurrentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef?.current?.offsetWidth) {
      setCurrentWidth(containerRef?.current?.offsetWidth);
    }
  }, [containerRef?.current?.offsetWidth]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor)
  );

  const {
    formState: { errors },
    control,
    reset,
    watch: SimpleSearchWatch,
    setError,
    clearErrors,
    handleSubmit,
  } = useForm({ mode: 'onSubmit' });

  const {
    control: itemDataControl,
    handleSubmit: itemSubmit,
    reset: resetItem,
    getValues,
    watch,
    trigger,
    formState: { errors: ColumnErrors, isDirty: isColDirty },
  } = useForm({ mode: 'onSubmit' });

  const enableDictionary = watch('inputType') === '2' || watch('inputType') === '4';

  const { data: dictionary } = useQuery(
    'Type Dic',
    async () => {
      const { data } = await client.type.getDicList();
      return data;
    },
    {
      initialData: queryClient.getQueryData('Type Dic'),
    }
  );

  const AddSimpleSearch = useMutation(client.simpleSearch.addSimpleSearch, {
    onSuccess: () => {
      toast('Add Successfully', {
        type: 'success',
      });
      history.push('/simpleSearch');
    },
    onError: (error: any) => {
      console.log(error);
    },
  });

  const EditSimpleSearch = useMutation(client.simpleSearch.editSimpleSearch, {
    onSuccess: () => {
      toast('Edit Success', {
        type: 'success',
      });
      history.push('/simpleSearch');
    },
  });

  useQuery(
    'workspace config',
    async () => {
      const { data } = await client.simpleSearch.getSimpleSearchById({
        id: id ?? '',
      });
      return data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setIncludeList(
          data.items.map((item) => {
            return {
              id: item.id,
              itemName: item.itemName,
              inputType: item.inputType,
              itemDictionary: item.itemDictionary,
              itemLs: [],
              colSize: item.colSize,
              rowSize: item.rowSize,
            };
          })
        );

        reset({
          misSimpleSearchId: id,
          misSimpleSearchName: data.misSimpleSearchName,
          misSimpleSearchSql: data.misSimpleSearchSql,
        });
      },
    }
  );

  const verifyPropSql = async (sql: string) => {
    if (!sql) {
      setError('propSql', { type: 'custom', message: 'This Field is required' });
      return false;
    }
    if (sql.length > 2000) {
      setError('propSql', { type: 'custom', message: 'Input value has exceed 2000 character' });
      return false;
    }

    clearErrors('propSql');
    return true;
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log('active===handleDragEnd===', active);
    console.log('over===handleDragEnd===', over);

    // if (
    //   active.data.current?.type === over?.id &&
    //   active.data.current?.type !== over?.data.current?.sortable.containerId
    // ) {
    //   console.log("same container");
    //   return;
    // }
    // if (!over?.data.current && active.id !== over?.id) {
    //   console.log("moving to other container");
    //   console.log(active.data.current?.data);
    //   if (over?.id === "droppable-1") {
    //     setExcludeList((items) => [...items, active.data.current?.data]);
    //     setIncludeList((item) =>
    //       item.filter((inner) => inner.id !== (active.id as string))
    //     );
    //   }
    //   if (over?.id === "droppable-2") {
    //     setIncludeList((items) => [...items, active.data.current?.data]);
    //     setActiveProperties(null);
    //     return;
    //   }
    // }
    if (active.data.current?.sortable?.containerId === over?.data.current?.sortable.containerId) {
      if (active.id !== over?.id && active.data.current?.sortable?.containerId === 'droppable-2') {
        setIncludeList((items) => {
          const oldIndex = items.findIndex((item) => item.id === (active?.id as string));
          const newIndex = items.findIndex((item) => item.id === (over?.id as string));

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    // if (active.id !== over?.id && active.data.current?.type === "droppable-1") {
    //   console.log("drop from available");
    //   if (includeList.length > 1) {
    //     setIncludeList((items) => {
    //       items.push(active.data.current?.data);
    //       const oldIndex = items.findIndex((item) => item.id === (active?.id as string));
    //       const newIndex = items.findIndex((item) => item.id === (over?.id as string));

    //       return arrayMove(items, oldIndex, newIndex);
    //     });
    //   } else {
    //     setIncludeList((items) => [...items, active.data.current?.data]);
    //   }
    //   setExcludeList((item) => item.filter((inner) => inner.id !== (active.id as string)));
    // }

    setActiveProperties(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    console.log('active===', active);
    setActiveProperties(active?.data.current?.data);
  }

  // const onSubmitHanlding = (value: any) => {

  // }

  const onSubmitHanlding = (value: any) => {
    const { misSimpleSearchName, misSimpleSearchSql, misSimpleSearchId } = value;
    if (includeList.length === 0) {
      toast('Simple Search Item cannot be empty', {
        type: 'error',
      });
      return;
    }
    if (includeList.length > 0) {
      console.log('includeList======', includeList);
      const items = includeList.map((item) => ({
        id: item.id.length === 5 ? '' : item.id,
        itemName: item.itemName,
        inputType: item.inputType,
        itemDictionary: item.itemDictionary,
        itemLs: [],
        rowSize: item.rowSize,
        colSize: item.colSize,
      }));
      if (!id) {
        return AddSimpleSearch.mutate({
          misSimpleSearchId: null,
          misSimpleSearchName,
          misSimpleSearchSql,
          items,
        });
      } else {
        return EditSimpleSearch.mutate({
          misSimpleSearchId: id,
          misSimpleSearchName,
          misSimpleSearchSql,
          items,
        });
      }
    }
  };

  const handleOnClose = (id: string) => {
    setIncludeList((currItems) => {
      return currItems.filter((chosenItem) => chosenItem.id !== id);
    });
  };

  const onErrorHandling = () => {
    if (includeList.length === 0) {
      toast('Simple Search Item cannot be empty', {
        type: 'error',
      });
    }
  };

  const handleProviewSubmit = () => {};

  return (
    <>
      <div>
        <Typography variant="h6">Simple Search Edit</Typography>
      </div>
      <Box
        sx={{ display: 'flex', padding: 2, justifyContent: 'start' }}
        component="form"
        onSubmit={handleSubmit(onSubmitHanlding, onErrorHandling)}
      >
        <Stack direction="row" spacing={2} paddingRight={2}>
          <Controller
            name="misSimpleSearchName"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                variant="standard"
                error={!!errors.misSimpleSearchName}
                InputLabelProps={{ shrink: !!value || isDirty }}
                onChange={onChange}
                value={value}
                label="Simple Search Name"
                helperText={errors.misSimpleSearchName?.message as string}
              />
            )}
          />
        </Stack>

        <Stack direction="row" display={'inline-flex'} spacing={2} alignItems={'end'}>
          <Button
            variant="outlined"
            size="small"
            sx={{ maxHeight: 40 }}
            startIcon={<MdAdd />}
            onClick={() => setIsDialogOpen(true)}
          >
            Add Search Item
          </Button>

          <Button
            variant="contained"
            sx={{ maxHeight: 40 }}
            size="small"
            startIcon={<PreviewIcon />}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            sx={{ maxHeight: 40 }}
            size="small"
            startIcon={<RiSave3Fill />}
            type="submit"
          >
            Save
          </Button>
        </Stack>
      </Box>
      {isPreviewOpen ? (
        <Card
          // style={{ ...style, overflowY: 'auto' }}
          sx={{ marginBottom: '40px' }}
          className={cn(undefined, styles.container)}
        >
          <div ref={titleRef} className={styles.title}>
            Simple Search
            <CgCloseR
              onClick={() => {
                setIsPreviewOpen(false);
              }}
            />
          </div>
          <Paper
            ref={containerRef}
            className={styles.wrapper}
            sx={{
              height: `calc(100%)`,
            }}
          >
            <form onSubmit={handleSubmit(handleProviewSubmit)}>
              <div className={styles.form}>
                {includeList?.map((item) =>
                  item.inputType === '0' || item.inputType === '10' ? (
                    <InputHandling
                      key={item.id}
                      value={{
                        input_type: item.inputType,
                        value: '',
                      }}
                      onChange={() => {}}
                      disabled={false}
                      error={''}
                      misColumnLabel={item.itemName}
                      misColumnInputType={item.inputType}
                      columnLs={item.itemLs}
                      style={{
                        gridColumn: `span ${item?.colSize}`,
                        gridRow: `span ${item?.rowSize}`,
                        minWidth: '150px',
                      }}
                    />
                  ) : (
                    <Controller
                      key={item.id}
                      name={item.itemName}
                      defaultValue={{
                        input_type: item.inputType,
                        value: '',
                      }}
                      control={control}
                      render={({ field: { value, onChange }, fieldState: { error } }) => {
                        console.log(error);

                        return (
                          <InputHandling
                            value={value}
                            onChange={onChange}
                            disabled={false}
                            error={error}
                            misColumnLabel={item.itemName}
                            misColumnInputType={item.inputType}
                            columnLs={item.itemLs}
                            style={{
                              gridColumn: `span ${item?.colSize}`,
                              gridRow: `span ${item?.rowSize}`,
                              minWidth: '150px',
                            }}
                          />
                        );
                      }}
                    />
                  )
                )}
              </div>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </form>
          </Paper>
        </Card>
      ) : (
        <></>
      )}
      {includeList.length > 0 ? (
        // <Paper sx={{ height: '100%' }}>
        <>
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragOver={(event) => {
              console.log(event);
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <FormContainer
                id="droppable-2"
                items={includeList}
                isEdit={isEdit}
                onColChange={(id, result) => {
                  const newList = includeList.map((item) => {
                    if (item.id === id) {
                      item.colSize = result;
                      return item;
                    }
                    return item;
                  });
                  setIncludeList(newList);
                }}
                onRowChange={(id, result) => {
                  const newList = includeList.map((item) => {
                    if (item.id === id) {
                      item.rowSize = result;
                      return item;
                    }
                    return item;
                  });
                  setIncludeList(newList);
                }}
                onClose={handleOnClose}
              />
              {activeProperties && (
                <DragOverlay>
                  <Item tableProps={activeProperties} />
                </DragOverlay>
              )}
            </div>
          </DndContext>
        </>
      ) : (
        // </Paper>
        <Paper
          sx={{
            height: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>No Items</div>
        </Paper>
      )}
      <Stack direction="row" sx={{ marginTop: 2, position: 'relative' }}>
        <Controller
          name="misSimpleSearchSql"
          control={control}
          defaultValue={''}
          rules={{
            validate: (value) => verifyPropSql(value ?? ''),
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextField
                variant="standard"
                error={!!errors.misSimpleSearchSql}
                onChange={onChange}
                value={value}
                label="Query Text"
                helperText={errors.misSimpleSearchSql?.message as string}
                multiline
                rows={4}
                fullWidth
                onBlur={() => {
                  // verifyPropSql(value ?? '');
                }}
                sx={{ width: '1000px' }}
              />
            </>
          )}
        />
      </Stack>

      <Dialog open={isDialogOpen} fullWidth>
        <form
          onSubmit={itemSubmit(
            (data) => {
              const t: SimpleSearchItem = {
                id: nanoid(5),
                itemName: data.itemName,
                inputType: data.inputType,
                itemDictionary: data.itemDictionary,
                itemLs: [],
                rowSize: data.rowSize,
                colSize: data.colSize,
              };
              setIncludeList((items) => [...items, t]);
              resetItem();
              setIsDialogOpen(false);
            },
            (error) => {
              console.log(error);
            }
          )}
        >
          <DialogTitle>Add Simple Search Item</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              paddingX: 6,
            }}
          >
            <Controller
              name="inputType"
              control={itemDataControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl fullWidth variant="standard" sx={{ width: '200px' }}>
                  <InputLabel error={!!ColumnErrors.misColumnInputType}>Input Type</InputLabel>
                  <Select
                    error={!!ColumnErrors.inputType}
                    autoWidth
                    variant="standard"
                    value={value}
                    onChange={(e) => {
                      onChange(e);
                      trigger('inputType');
                    }}
                  >
                    {simpleSearchItemType.map((item) => (
                      <MenuItem
                        key={item.key}
                        value={item.key}
                        disabled={typeList
                          .find((item) => item.key === watch('inputType'))
                          ?.disabled?.includes(item?.key)}
                      >
                        {item.value}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!ColumnErrors.inputType && (
                    <FormHelperText error>
                      {ColumnErrors?.inputType.message as string}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="itemName"
              control={itemDataControl}
              rules={{
                required: watch('inputType') != '10' && 'This Field is required',
                maxLength: {
                  value: 40,
                  message: 'Input value has exceed 40 character',
                },
                pattern: {
                  value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                  message: 'Item name could not contain special characeter',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!ColumnErrors.itemName}
                  onChange={onChange}
                  variant="standard"
                  value={value}
                  margin="normal"
                  helperText={ColumnErrors.itemName?.message as string}
                  label="Item Name"
                  sx={{ width: '200px' }}
                />
              )}
            />
            <Controller
              name="colSize"
              control={itemDataControl}
              rules={{
                required: 'This Field is required',
                validate: {
                  minimum: (value) =>
                    Number(value || 1) > 1 || 'The length of column cannot be smaller than 1',
                  max: (value) =>
                    Number(value || 12) <= 12 || 'The length of column cannot be greater than 12',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!ColumnErrors.colSize}
                  onChange={onChange}
                  variant="standard"
                  value={value}
                  type="number"
                  margin="normal"
                  helperText={ColumnErrors.colSize?.message as string}
                  label="Column Size"
                  sx={{ width: '200px' }}
                />
              )}
            />
            <Controller
              name="rowSize"
              control={itemDataControl}
              rules={{
                required: 'This Field is required',
                validate: {
                  minimum: (value) =>
                    Number(value || 1) >= 1 || 'The length of column cannot be smaller than 1',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!ColumnErrors.rowSize}
                  onChange={onChange}
                  variant="standard"
                  value={value}
                  type="number"
                  margin="normal"
                  helperText={ColumnErrors.rowSize?.message as string}
                  label="Row Size"
                  sx={{ width: '200px' }}
                />
              )}
            />

            {enableDictionary && (
              <Controller
                name="itemDictionary"
                control={itemDataControl}
                rules={{
                  required: {
                    value: enableDictionary,
                    message: 'This Field is required',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth variant="standard" sx={{ width: '200px' }}>
                    <InputLabel error={!!ColumnErrors.itemDictionary}>Data Dictionary</InputLabel>
                    <Select
                      autoWidth
                      error={!!ColumnErrors.itemDictionary}
                      variant="standard"
                      value={value}
                      label="Data Dictionary"
                      onChange={onChange}
                    >
                      {Array.isArray(dictionary) &&
                        dictionary.map((item) => (
                          <MenuItem key={item.key} value={item.key}>
                            {item.value}
                          </MenuItem>
                        ))}
                    </Select>
                    {!!ColumnErrors.itemDictionary && (
                      <FormHelperText error>
                        {ColumnErrors?.itemDictionary.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit" disabled={!isColDirty}>
              Confirm
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                resetItem();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default EditSimpleSearch;

const Item = forwardRef<HTMLDivElement, { tableProps: SimpleSearchItem }>(
  ({ tableProps, ...props }, ref) => {
    console.log(tableProps);
    return (
      <Card
        {...props}
        ref={ref}
        style={{
          height: '100px',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        }}
      >
        <DemoInputHandling {...tableProps} />
      </Card>
    );
  }
);
