import { FormContainer, PropertyContainer, TypeContainer } from '../../components';
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
  useDroppable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext } from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Button,
  Box,
  Card,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import { TableColumn } from 'libs/common/src/lib/api';
import type {
  UpdatePropertyV2Input,
  PropertyConfigDetail,
  IPropertyConfigCols,
} from 'libs/common/src/lib/api';
import { LockLevel } from 'libs/common/src/lib/constant';
import { useApi } from 'libs/common/src/lib/hooks';
import { DemoInputHandling } from 'libs/common/src/lib/utils';
import { nanoid } from 'nanoid';
import { forwardRef, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Controller, useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const PropertyDetailPage = () => {
  const history = useHistory();
  const client = useApi();
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);

  const [includeList, setIncludeList] = useState<IPropertyConfigCols[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [excludeList, setExcludeList] = useState<TableColumn[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('empty');
  // const [restrictedIndex, setRestrictedIndex] = useState<number>();
  const [activeProperties, setActiveProperties] = useState<TableColumn | null>(null);

  const [includeTabsList, setIncludeTabsList] = useState<TypeDataItem[]>([]);
  const [excludeTabsList, setExcludeTabsList] = useState<TypeDataItem[]>([]);
  const [typeProperties, setTypeProperties] = useState<TypeDataItem | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [tabMaps, setTabMaps] = useState<{ [key: string]: any }>({});
  const { data: typeDicList } = useQuery(
    ['Type Dic'],
    async () => {
      const { data: response } = await client.queryForm.getTypeDic();
      return response;
    },
    {}
  );

  const methods = useForm<IPropertyDetailInput>({
    mode: 'onSubmit',
    defaultValues: {
      propertyConfig: {
        misPropertyName: '',
        misPropertyTableId: '',
        misLockedLevel: undefined,
      },
    },
  });
  const {
    control,
    reset,
    getValues,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;
  const {
    fields: cols,
    append: appendCols,
    swap,
    remove,
    insert,
    update: updateCols,
  } = useFieldArray({
    control,
    name: 'propertyConfigDetails',
  });
  const includedFields =
    watch('propertyConfigDetails') &&
    watch('propertyConfigDetails').reduce((prev: IPropertyConfigDetail['columns'], next) => {
      prev = [...prev, ...next.columns];
      return prev;
    }, []);
  const disaleFields = includedFields?.length > 0;
  const misPropertyTableId = watch('propertyConfig.misPropertyTableId');

  const { data: tableProperties } = useQuery(
    ['Table', misPropertyTableId],
    async () => {
      const { data } = await client.type.selectTypeById({
        id: misPropertyTableId ?? '',
      });
      return data;
    },
    {
      enabled: !!misPropertyTableId,
      onSuccess: (data) => {
        if (!paramId) {
          setExcludeList(data?.misColumnList.map((item) => ({ ...item, id: '' })));
        }
      },
    }
  );
  const { data: propertyDetail } = useQuery(
    ['Property Detail', paramId, tableProperties?.misColumnList],
    async () => {
      const { data: response } = await client.property.getPropertyDetail({ id: paramId ?? '' });
      return response;
    },
    {
      enabled: !!paramId && tableProperties && tableProperties?.misColumnList.length > 0,
      onSuccess: (data) => {
        const { propertyConfigDetails, propertyTabConfs, ...otherdata } = data;
        const columns = propertyConfigDetails.map(({ columns, name, misPropertySectionId }) => ({
          name,
          misPropertySectionId,
          columns: columns.map((item) => {
            const tableProps = tableProperties?.misColumnList.find(
              (i) => i.misColumnId === item.misPropertyConfigDetailColumnId
            );

            return {
              ...item,
              misColumnLabel: tableProps?.misColumnLabel,
              misColumnInputType: tableProps?.misColumnInputType,
            };
          }),
          uid: nanoid(),
        }));
        if (propertyTabConfs && propertyTabConfs.length > 0) {
          const selectTab =
            propertyTabConfs.map((item: any) => ({
              id: item.misTypeId,
              name: item.misTypeLabel,
              workspaceId: item.misWorkspaceId,
            })) || [];
          setActiveTab(propertyTabConfs[0].misTypeId as string);
          propertyTabConfs.forEach(function (item, index) {
            tabMaps[item.misTypeId] = item.misWorkspaceId;
          });
          setTabMaps(tabMaps);
          setIncludeTabsList(selectTab);
        }
        reset({
          ...otherdata,
          propertyConfigDetails: columns,
        });
        if (columns.length > 0) {
          setCurrentTab(columns[0].uid);
        }
      },
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    console.log(active);
    setActiveProperties(active?.data.current?.data);
  }

  useQuery(
    ['Column Dic', misPropertyTableId, tableProperties?.misTypeId, paramId],
    async () => {
      const { data: response } = await client.queryForm.getColumnDic({
        id: misPropertyTableId,
      });
      return response;
    },
    {
      enabled: !!misPropertyTableId && !!propertyDetail && !!tableProperties,
      onSuccess: () => {
        console.log('running');
        console.log(propertyDetail, tableProperties);
        if (tableProperties?.misColumnList) {
          const unselectedItem = tableProperties?.misColumnList
            .filter(
              (item) =>
                !includedFields
                  .map((i) => i.misPropertyConfigDetailColumnId)
                  .includes(item.misColumnId)
            )
            .map((item) => ({ ...item, id: '' }));
          setExcludeList(unselectedItem);
        }
        if (relationList && relationList.length > 0) {
          const unselectTab = relationList
            .map((item: any) => ({
              id: item.typeId,
              name: item.typeName,
            }))
            .filter((item: any) => !propertyTabIdArr.includes(item.id));
          setExcludeTabsList(unselectTab);
        }
      },
    }
  );
  const propertyTabIdArr = useMemo(
    () => propertyDetail?.propertyTabConfs.map((i) => i.misTypeId) ?? [],
    [propertyDetail?.propertyTabConfs]
  );

  const { data: relationList } = useQuery(
    ['Type Ref', misPropertyTableId],
    async () => {
      const { data: response } = await client.relation.getRelationByTypeId({
        tableId: misPropertyTableId ?? '',
      });
      return response;
    },
    {
      enabled: !!misPropertyTableId,
      onSuccess: (data) => {
        if (!paramId) {
          const unselectedTab = data.map((item: any) => ({
            id: item.typeId,
            name: item.typeName,
          }));
          setExcludeTabsList(unselectedTab);
        }
      },
    }
  );
  const UpdateProperty = useMutation(client.property.updateProperty, {
    onSuccess: () => {
      toast('Update successfully', {
        type: 'success',
      });
      history.push(route.propertyPage);
    },
  });

  const AddProperty = useMutation(client.property.addProperty, {
    onSuccess: () => {
      toast('Add successfully', {
        type: 'success',
      });
      history.push(route.propertyPage);
    },
  });

  const submitHandling = async ({
    propertyConfig,
    propertyConfigDetails,
  }: IPropertyDetailInput) => {
    console.log(propertyConfigDetails);
    const newColumnDetails = propertyConfigDetails.map((items) => ({
      name: items.name,
      misPropertySectionId: items.misPropertySectionId,
      columns: items.columns.map((i) => ({
        misColumnInputType: i.misColumnInputType,

        colSize: i.colSize ?? 1,
        columnConfigDetail: i.columnConfigDetail ?? '',
        creationDate: i.creationDate,

        creatorUserId: i.creatorUserId ?? '',
        id: i.id,

        misColumnLabel: i.misColumnLabel ?? '',
        misIsLock: i.misIsLock ?? 'N',
        misLockedBy: i.misLockedBy ?? '',
        misPropertyConfigDetailColumnId: i.misPropertyConfigDetailColumnId,
        misPropertyConfigDetailId: i.misPropertyConfigDetailId ?? '',
        misPropertyId: i.misPropertyId ?? '',
        misPropertySectionId: i.misPropertySectionId ?? '',
        rowSize: i.rowSize ?? 1,
        updatedDate: i.updatedDate ?? null,
        updatedUserId: i.updatedUserId ?? null,
      })),
    }));
    try {
      if (paramId) {
        UpdateProperty.mutate({
          propertyConfig,
          propertyConfigDetails: newColumnDetails,
          propertyTabConfs: includeTabsList.map((item: any) => ({
            misPropertyTabConfId: '',
            misPropertyId: paramId,
            misTypeId: item.id,
            misWorkspaceId: tabMaps[item.id],
          })),
        });
      } else {
        AddProperty.mutate({
          propertyConfig,
          propertyConfigDetails: newColumnDetails,
          propertyTabConfs: includeTabsList.map((item: any) => ({
            misPropertyTabConfId: '',
            misPropertyId: '',
            misTypeId: item.id,
            misWorkspaceId: tabMaps[item.id],
          })),
        });
      }
    } catch (error: any) {
      toast.error(error?.message as string);
    }
  };

  function handleDragTypeEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.data.current?.type === over?.id) {
      console.log('same container');
      return;
    }
    if (!over?.data.current && active.id !== over?.id) {
      console.log('moving to other container');
      console.log(active.data.current?.data);
      if (over?.id === 'droppable-3') {
        setIncludeTabsList((items) => [...items, active.data.current?.data]);
        setExcludeTabsList((item) => item.filter((inner) => inner.id !== (active.id as string)));
      }
      if (over?.id === 'droppable-4') {
        setIncludeTabsList((items) => [...items, active.data.current?.data]);
        setExcludeTabsList((item) => item.filter((inner) => inner.id !== (active.id as string)));
        setActiveTab(active.data.current?.data?.id);
        setTypeProperties(null);
        return;
      }
    }
  }
  function handleDragTypeStart(event: DragStartEvent) {
    const { active } = event;
    setTypeProperties(active?.data.current?.data);
  }
  const handleTabsChange = (item: any) => {
    const tabMap = { ...tabMaps };
    item.forEach((value: any, key: any, item: any) => {
      tabMap[key] = value;
    });
    setTabMaps(tabMap);
  };
  const { data: workspaceList } = useQuery(
    ['Workspace'],
    async () => {
      const { data: response } = await client.workspace.getWorkspaceList();
      return response;
    },
    {}
  );
  return (
    <FormProvider {...methods}>
      <div>
        <Typography variant="h6">Property Config</Typography>
      </div>
      <form
        onSubmit={handleSubmit(submitHandling, (error) => {
          console.log(error);
        })}
      >
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="propertyConfig.misPropertyName"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                InputLabelProps={{ shrink: !!value || isDirty }}
                id="standard-basic"
                variant="standard"
                error={!!errors?.propertyConfig?.misPropertyName}
                onChange={onChange}
                value={value}
                label="Property Page Name"
                helperText={errors?.propertyConfig?.misPropertyName?.message as string}
              />
            )}
          />

          <Controller
            name="propertyConfig.misPropertyTableId"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 200 }}
                error={!!errors?.propertyConfig?.misPropertyTableId}
              >
                <InputLabel shrink={!!value}>Table</InputLabel>
                <Select
                  disabled={disaleFields}
                  notched={!!value}
                  renderValue={(newVal) => typeDicList?.find((item) => item.key === newVal)?.value}
                  value={value}
                  onChange={onChange}
                >
                  {typeDicList?.map((item) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>
                  {errors?.propertyConfig?.misPropertyTableId?.message}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="propertyConfig.misLockedLevel"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 200 }}
                error={!!errors?.propertyConfig?.misLockedLevel}
              >
                <InputLabel shrink={!!value}>Lock level</InputLabel>
                <Select
                  notched={!!value}
                  displayEmpty
                  renderValue={(newVal) => {
                    return LockLevel?.find((item) => item.key === newVal || value)?.value;
                  }}
                  value={value}
                  onChange={onChange}
                >
                  {LockLevel.map((item) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>{errors?.propertyConfig?.misLockedLevel?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
        <DndContext
          sensors={sensors}
          onDragEnd={(event) => {
            setActiveProperties(null);
            if (
              !event?.over?.data.current &&
              event.active.data.current?.type === 'droppable-1' &&
              event.over?.id !== 'droppable-1'
            ) {
              setExcludeList((item) => item.filter((i) => i.misColumnId !== event.active.id));
            }
            if (
              !event?.over?.data.current &&
              event.active.data.current?.type !== 'droppable-1' &&
              event.over?.id === 'droppable-1'
            ) {
              const props = tableProperties?.misColumnList.find(
                (item) =>
                  item.misColumnId ===
                  event.active.data.current?.data.misPropertyConfigDetailColumnId
              );
              setExcludeList((item) => [...item, { ...event.active.data.current?.data, ...props }]);
            }
            if (!event?.over?.data.current && event.active.data.current?.type === 'droppable-1') {
              // if (typeof restrictedIndex === 'number' && !getValues(`propertyConfigDetails.${restrictedIndex}.misPropertyTableId`)) {
              //   console.log(event.active.data.current)
              //   updateCols(restrictedIndex, { ...getValues(`propertyConfigDetails.${restrictedIndex}`), misPropertyTableId: getValues('propertyConfig.misPropertyTableId') })
              // }
            }
          }}
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
            }}
          >
            <PropertyContainer id="droppable-1" items={excludeList} disabled={false} />

            <FormControlLabel
              control={<Switch checked={isEdit} onChange={() => setIsEdit((val) => !val)} />}
              label="Edit Mode"
              sx={{
                alignSelf: 'end',
              }}
            />
            <Box sx={{ display: 'flex' }}>
              <Tabs
                orientation="vertical"
                value={currentTab}
                onChange={(_, val) => {
                  setCurrentTab(val);
                }}
              >
                {cols.map((item, index) => (
                  <Tab
                    key={item.id}
                    label={watch(`propertyConfigDetails.${index}.name`)}
                    value={item.uid}
                    onClick={() => {
                      console.log('trigger', index);
                      // setRestrictedIndex(index)
                      // if (!!getValues(`propertyConfigDetails.${index}.misPropertyTableId`)) {

                      //   setValue("propertyConfig.misPropertyTableId", getValues(`propertyConfigDetails.${index}.misPropertyTableId`))
                      // }
                    }}
                  />
                ))}
                <Tab
                  label="Add Section"
                  sx={{ color: (theme) => theme.palette.primary.main }}
                  icon={<AddIcon />}
                  iconPosition="start"
                  onClick={() => {
                    const newId = nanoid(4);
                    appendCols({
                      misPropertySectionId: '',
                      name: 'New Section',
                      uid: newId,
                      columns: [],
                    });

                    // setRestrictedIndex(undefined)
                    setCurrentTab(newId);
                  }}
                />
              </Tabs>
              <TabContext value={currentTab}>
                <TabPanel value="empty" sx={{ height: '100%', width: '70vw' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                    }}
                  >
                    <AddToPhotosIcon fontSize="large" sx={{ display: 'block', mb: 2 }} />
                    <div>Add Section to add New form</div>
                  </Box>
                </TabPanel>
                {cols.map((item, index) => (
                  <TabPanel key={item.id} value={item.uid} sx={{ height: '100%' }}>
                    <Stack direction="row" justifyContent={'space-between'} spacing={2} mt={1}>
                      <Controller
                        name={`propertyConfigDetails.${index}.name`}
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
                          <TextField
                            InputLabelProps={{ shrink: !!value || isDirty }}
                            id="standard-basic"
                            variant="standard"
                            error={
                              !!errors?.propertyConfigDetails &&
                              !!errors?.propertyConfigDetails[index]?.message
                            }
                            onChange={onChange}
                            value={value}
                            label="Column Name"
                            helperText={
                              !!errors?.propertyConfigDetails &&
                              !!errors?.propertyConfigDetails[index]?.message
                            }
                          />
                        )}
                      />
                      <Stack direction="row">
                        <Button
                          color="error"
                          onClick={() => {
                            remove(index);
                            // setRestrictedIndex(undefined)
                            if (cols.length > 0) {
                              setCurrentTab(cols[cols.length - 1].uid);
                            }
                            setCurrentTab('empty');
                          }}
                          variant="outlined"
                        >
                          Delete Section
                        </Button>
                      </Stack>
                    </Stack>
                    <FormContainer
                      sectionId={item.misPropertySectionId}
                      onDelete={(item) => {
                        setExcludeList((prev) => [...prev, item as TableColumn]);
                      }}
                      index={index}
                      isEdit={isEdit}
                    />
                  </TabPanel>
                ))}
              </TabContext>
            </Box>
            <DragOverlay>{activeProperties && <Item tableProps={activeProperties} />}</DragOverlay>
          </div>
        </DndContext>

        <DndContext
          sensors={sensors}
          onDragEnd={handleDragTypeEnd}
          onDragStart={handleDragTypeStart}
          onDragOver={(event) => {
            console.log(event);
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <TypeContainer id="droppable-3" items={excludeTabsList} />

            <TabsContainer
              id="droppable-4"
              items={includeTabsList}
              workspaceList={workspaceList}
              activeTab={activeTab}
              tabMap={tabMaps}
              paramId={paramId}
              onTabsChange={handleTabsChange}
              onActiveTabChange={(tab) => setActiveTab(tab)}
            ></TabsContainer>

            <DragOverlay>{typeProperties && <TabsItem tableProps={typeProperties} />}</DragOverlay>
          </div>
        </DndContext>

        <Stack direction="row" spacing={2} mt={2}>
          <Button disableElevation variant="contained" sx={{}} startIcon={<FaSave />} type="submit">
            Save
          </Button>
          <Button onClick={() => history.goBack()} variant="outlined">
            Cancel
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default PropertyDetailPage;

export interface DataItem {
  id: string;
  name: string;
  col: number;
  row: number;
  properties: any;
  type?: string;
  checked?: boolean;
  misPropertyConfigDetailId?: string;
}

const Item = forwardRef<HTMLDivElement, { tableProps: TableColumn }>(
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

export type IPropertyDetailInput = {
  propertyConfigDetails: Array<IPropertyConfigDetail & { uid: string }>;
  exceludedColumns: Array<
    IPropertyConfigCols & { misColumnLabel: string; misColumnInputType: string }
  >;
  propertyConfig: PropertyConfigDetail;
};
export interface IPropertyConfigDetail {
  name: string;
  misPropertySectionId: string;
  columns: Array<IPropertyConfigCols & { misColumnLabel: string; misColumnInputType: string }>;
}

export interface TypeDataItem {
  id: string;
  name: string;
  workspaceId: string;
}
const TabsContainer = ({
  id,
  items,
  activeTab,
  onActiveTabChange,
  workspaceList,
  onTabsChange,
  tabMap,
  paramId,
}: {
  id: string;
  activeTab: string;
  onActiveTabChange: (val: string) => void;
  onTabsChange: (val: Map<string, any>) => void;
  items: Array<{
    id: string;
    name: string;
    workspaceId: string;
  }>;
  workspaceList: Array<{
    misWorkspaceId: string;
    misWorkspaceName: string;
  }>;
  tabMap: any;
  paramId: any;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const handleChange = (event: any) => {
    const content = new Map();
    content.set(activeTab, event.target.value);
    onTabsChange && onTabsChange(content);
  };

  const containerStyle: CSSProperties = {
    width: '70vw',
    padding: '16px',
  };
  return (
    <SortableContext id={id} items={items}>
      <Paper ref={setNodeRef} style={containerStyle}>
        <Tabs value={activeTab} onChange={(e, val) => onActiveTabChange(val)}>
          {items.map((item, index) => (
            <Tab key={`tab-${index}`} value={item.id} label={item.name} />
          ))}
        </Tabs>
        <TabContext value={activeTab}>
          {items.map((item, index) => (
            <TabPanel value={item.id} key={item.id}>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
                <InputLabel>Workspace</InputLabel>
                <Select value={tabMap[item.id]} onChange={handleChange}>
                  {workspaceList?.map((ws: any) => {
                    return (
                      <MenuItem key={ws.misWorkspaceId} value={ws.misWorkspaceId}>
                        {ws.misWorkspaceName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </SortableContext>
  );
};
const TabsItem = forwardRef<HTMLDivElement, { tableProps: TypeDataItem }>(
  ({ tableProps, ...props }, ref) => {
    console.log(tableProps);
    return (
      <Card
        {...props}
        ref={ref}
        style={{
          height: '50px',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        }}
      >
        <Typography variant="subtitle1" sx={{ color: 'black' }}>
          {tableProps.name}
        </Typography>
      </Card>
    );
  }
);
