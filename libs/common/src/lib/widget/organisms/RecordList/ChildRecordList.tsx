import type {
  QfColumns,
  QfConditions,
  QueryFormDetailCrossRef,
  SimpleSearchItem,
} from '../../../api';
import {
  GetTableColumnDataV2,
} from 'libs/common/src/lib/api/recordService';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { WidgetContext } from '../../../context/WidgetContext';
import { useApi, useDialog, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import icon from '../../../style/icon/iconHandler';
import { InputHandling, typeChecking, InputTabHandling } from '../../../utils';
import styles from '../GridWrapper/GridWrapper.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SortModel } from 'libs/common/src/lib/api/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const schema = yup.object().shape({
  wfProcessName: yup.string().required('This Field is required'),
  processActivities: yup.array().of(
    yup.object().shape({
      wfProcessActivitiesActivity1Id: yup.string().required('This Field is required'),
      wfProcessActivitiesActivity2Id: yup.string().required('This Field is required'),
    })
  ),
});
const ChildRecordList = () => {
  const client = useApi();
  const { data, updateWidget, updateWidgets, config } = useWidget<{
    id: string;
    searchParams?: {
      qfColumns: QfColumns[];
      typeId: string;
      qfConditions: QfConditions[];
      crossRef: QueryFormDetailCrossRef[];
    };
    simpleSearchParams?: { simpleSearchId: string; searchConditons: string };
    tab: number;
    typeId: string;
    parentRecId: string;
    edit: number;
  }>('Child Record List');

  const [typeId, setTypeId] = useState<string>('');
  let recordLists: string[] = [];
  useEffect(() => {
    if (data.typeId) {
      setTypeId(data.typeId);
    }
  }, [data.typeId]);
  const [tab, setTab] = useState<number>(0);
  const [tableColumnData, setTableColumnData] = useState<GetTableColumnDataV2[]>([]);
  const [recordId, setRecordId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [creationOpen, setCreationOpen] = useState(false);
  const [simpleSearchOpen, setSimpleSearchOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [tabMaps, setTabMaps] = useState<{ [key: string]: any }>({});
  const [searchItems, setSearchItems] = useState<SimpleSearchItem[]>([]);
  const [simpleSearchId, setSimpleSearchId] = useState<string>('');
  const [propertyId, setPropertyId] = useState<string>('');
  const { id, widgetId, editMode } = useContext(WidgetContext);
  const { openDialog } = useDialog();
  let token = sessionStorage.getItem('token');
  const { data: widgetResponse } = useQuery(
    ['Simple Search', widgetId],
    async () => {
      const { data: widgetResponse } = await client.widget.getSimpleSearchById({
        id: widgetId ?? '',
      });
      return widgetResponse;
    },
    {
      enabled: widgetId ? true : false,
      onSuccess: (data) => {
        if(data){
          setSearchItems(
            data.items.map((item: any) => {
              return {
                id: item.id,
                itemName: item.itemName,
                inputType: item.inputType,
                itemDictionary: item.itemDictionary,
                itemLs: item.itemLs ?? [],
                colSize: item.colSize,
                rowSize: item.rowSize,
              };
            })
          );
        }
      },
    }
  );
  const { data: searchResponse } = useQuery(
    ['Search', widgetId],
    async () => {
      const { data: searchResponse } = await client.widget.getWidgetById({
        id: widgetId ?? '',
      });
      return searchResponse;
    },
    {
      onSuccess: (result) => {
        if (null != result) {
          if (null != result.misWidgetConfig) {
            var obj = JSON.parse(result.misWidgetConfig);
            if(obj.simpleSearchId){
              setSimpleSearchId(obj.simpleSearchId);
            }
            if(obj.propertyId){
              setPropertyId(obj.propertyId);
            }
          }
        }
      },
    }
  );
  const handleTabsChange = (item: any) => {
    const tabMap = { ...tabMaps };
    if (tabMaps[typeId]) {
      recordLists = tabMaps[typeId];
    }
    let recordIds = '';
    item.forEach((value: any, key: any) => {
      recordLists = recordLists.concat(value.split(','));
      let arr = new Set(recordLists);
      recordIds = Array.from(arr).join(',');
      tabMap[key] = Array.from(arr);
    });
    setTabMaps(tabMap);
    setSimpleSearchOpen(false);
    if (data.tab == 0) {
      sessionStorage.setItem(token + 'cre_' + typeId, recordIds);
    } else if (data.tab == 1) {
      sessionStorage.setItem(token + 'pro_' + typeId, recordIds);
    }
  };
  useEffect(() => {
    if (data.tab) {
      setTab(data.tab);
    }
  }, [data.tab]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });
  useEffect(() => {
    if (data.searchParams === null) {
      setTab(data.tab);
    }
    if (data.simpleSearchParams != null) {
      setTab(2);
    }
  }, [data.searchParams, data.simpleSearchParams]);
  const [dataGridSortModel, setDataGridSortModel] = useState<GridSortItem[]>([]);

  const { data: tableColumns } = useQuery(
    ['table columns', propertyId],
    async () => {
      const { data: tableResponse } = await client.recordManage.getTableColumnByPropertyId({
        id: propertyId,
      });
      return tableResponse;
    },
    {
      enabled: !!propertyId,
      onSuccess: (data) => {
        setTableColumnData(data);
      },
    }
  );
  const submitTabData = () => {
    getTypesRecordId.mutate({ id: data.typeId });
  };
  const [sortModel, setSortModel] = useState<SortModel[]>([]);

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(
      newSortModel.map((item) => ({
        field: item.field || '',
        sort: item.sort || '',
      }))
    );
    setDataGridSortModel(newSortModel);
  }, []);
  const getTypesRecordId = useMutation(client.recordManage.getRecordIdByTypeId, {
    onSuccess: (res) => {
      if (res.data) {
        const myForm = document.querySelector('#creationForm') as HTMLFormElement;
        const elements = myForm.querySelectorAll('input, select, textarea');
        let tabData: { [key: string]: any } = {};
        let values = res.data + ',';
        let saveValues = res.data + ',';
        for (let i = 1; i < columns.length-1; i++) {
          for (let j = 0; j < elements.length; j++) {
            const el = elements[j] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            //tabData[el.name] = { input_type: 1, value: el.value };
            if(columns[i].field == el.name){
              saveValues += el.name + ':' + el.value + '#';
              values += el.value + ',';
            }
          }
        }
        let itemName = 'cre_';
        if (data.tab == 1) {
          itemName = 'pro_';
        }
        if (sessionStorage.getItem(token + itemName + 'add_' + typeId)) {
          sessionStorage.setItem(
            token + itemName + 'add_' + typeId,
            sessionStorage.getItem(token + itemName + 'add_' + typeId) + '&' + values
          );
          sessionStorage.setItem(
            token + itemName + 'save_' + typeId,
            sessionStorage.getItem(token + itemName + 'save_' + typeId) + '&' + saveValues
          );
        } else {
          sessionStorage.setItem(token + itemName + 'add_' + typeId, values);
          sessionStorage.setItem(token + itemName + 'save_' + typeId, saveValues);
        }
        if (sessionStorage.getItem(token + itemName + typeId)) {
          sessionStorage.setItem(
            token + itemName + typeId,
            sessionStorage.getItem(token + itemName + typeId) + ',' + res.data
          );
        } else {
          sessionStorage.setItem(token + itemName + typeId, res.data);
        }
        const tabMap = { ...tabMaps };
        if (tabMaps[typeId]) {
          recordLists = tabMaps[typeId];
        }
        recordLists.push(res.data);
        let arr = new Set(recordLists);
        tabMap[typeId] = Array.from(arr);
        setTabMaps(tabMap);
        setCreationOpen(false);
        reset();
      }
    },
  });
  useEffect(() => {
    let ids: any;
    const tabMap = { ...tabMaps };
    if (data.tab == 0) {
      ids = sessionStorage.getItem(token + 'cre_' + typeId);
    } else if (data.tab == 1) {
      ids = sessionStorage.getItem(token + 'pro_' + typeId);
    }
    if (ids) {
      let records = ids.split(',');
      for (let i = 0; i < records.length; ++i) {
        recordLists.push(records[i]);
      }
      tabMap[data.typeId] = recordLists;
      setTabMaps(tabMap);
    } else {
      recordLists = [];
    }
  }, [
    tab,
    sessionStorage.getItem(token + 'cre_' + typeId),
    sessionStorage.getItem(token + 'pro_' + typeId),
  ]);

  const {
    data: tabColumns,
    isLoading,
    refetch,
  } = useQuery(
    ['tab record', tabMaps],
    async () => {
      const { data: tableResponse } = await client.recordService.getTabRecordByRecIds({
        typeId: data.typeId,
        recordIdList: tabMaps[data.typeId] == undefined ? [] : tabMaps[data.typeId],
      });
      return tableResponse;
    },
    {
      enabled:
        (!!data.typeId && tabMaps[data.typeId] == undefined) || tabMaps[data.typeId] != undefined,
    }
  );
  const columns: GridColDef[] = useMemo(() => {
    const tmp =
      tabColumns?.columnList.map((item) => {
        const newItem: GridColDef = item && {
          field: item?.misColumnName,
          headerName: item?.misColumnLabel,
          valueFormatter: ({ value }) =>
            item.misColumnType === '4' ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd') : value,
          flex: 2,
          minWidth: 120,
        };
        return newItem;
      }) ?? [];

    var action = [
      {
        field: 'action',
        headerName: 'Action',
        minWidth: 120,
        flex: 1,
        valueFormatter: (value: any) => {},
        renderCell: (params: any) => {
          return (
            <div>
              <Button
                startIcon={<AiOutlineDelete />}
                variant="outlined"
                size="small"
                color="error"
                disabled={data.tab == 0 ? false : data.tab == 1 && !data.edit ? true : false}
                onClick={() => {
                  openDialog('deleteDialog', {
                    title: 'Delete Relation',
                    message: `Are you sure to delete this relation`,
                    confirmAction: () => {
                      for (const key in tabMaps[typeId]) {
                        if (params.row.id == tabMaps[typeId][key]) {
                          tabMaps[typeId] = tabMaps[typeId].filter(
                            (item: any) => item !== params.row.id
                          );
                        }
                      }
                      if (data.tab == 0) {
                        sessionStorage.setItem(token + 'cre_' + typeId, tabMaps[typeId]);
                        let addValues = sessionStorage.getItem(token + 'cre_add_' + typeId) || null;
                        let saveValues =
                          sessionStorage.getItem(token + 'cre_save_' + typeId) || null;
                        let tabValue = addValues?.split('&') || [];
                        let saveValue = saveValues?.split('&') || [];
                        let tabDatas = '';
                        let saveDatas = '';
                        for (let i = 0; i < tabValue.length; ++i) {
                          if (!tabValue[i].includes(params.row.id)) {
                            tabDatas += tabValue[i] + '&';
                          }
                        }
                        for (let i = 0; i < saveValue.length; ++i) {
                          if (!saveValue[i].includes(params.row.id)) {
                            saveDatas += saveValue[i] + '&';
                          }
                        }
                        sessionStorage.setItem(token + 'cre_add_' + typeId, tabDatas);
                        sessionStorage.setItem(token + 'cre_save_' + typeId, saveDatas);
                      } else if (data.tab == 1) {
                        sessionStorage.setItem(token + 'pro_' + typeId, tabMaps[typeId]);
                      }
                    },
                  });
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ];
    return tmp.concat(action);
  }, [tabColumns?.columnList, data.edit]);

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {!typeId && 'Please Select a table'}
      {rows.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
  );
  const rows = useMemo(() => {
    let strArr: string[][] = tabColumns?.recordList || [];
    let rowsData = [];
    for (let i = 0; i < strArr.length; i++) {
      let obj: { [key: string]: any } = {};
      for (let j = 0; j < strArr[i].length; j++) {
        obj[columns[j].field] = strArr[i][j];
      }
      rowsData.push(obj);
    }
    if (tabColumns && tabColumns.columnList[0].misTypeId == data.typeId) {
      let tabValue = '';
      if (data.tab == 0) {
        tabValue = sessionStorage.getItem(token + 'cre_add_' + data.typeId) || '';
      } else if (data.tab == 1) {
        tabValue = sessionStorage.getItem(token + 'pro_add_' + data.typeId) || '';
      }
      if (tabValue != null && tabValue != '') {
        let addValues = tabValue?.split('&') || [];
        for (let i = 0; i < addValues.length; i++) {
          if ('' != addValues[i]) {
            let obj: { [key: string]: any } = {};
            let values = addValues[i].split(',');
            for (let j = 0; j < values.length; j++) {
              if (j != values.length - 1) {
                obj[columns[j].field] = values[j];
              }
            }
            rowsData.push(obj);
          }
        }
      }
    }
    return rowsData;
  }, [
    columns,
    tabColumns?.recordList,
    sessionStorage.getItem(token + 'cre_add_' + data.typeId),
    sessionStorage.getItem(token + 'pro_add_' + data.typeId),
  ]);

  const [rowCount, setRowCount] = useState(0);
  useEffect(() => {
    setRowCount((prevRowCount) =>
      tabColumns?.total !== undefined ? tabColumns?.total : prevRowCount
    );
  }, [tab, tabColumns?.total, setRowCount]);
  useEffect(() => {
    client.folderService.getDefaultFolder().then((res) => {
      const defaultFolder = res.data.misFolderId;
      if (defaultFolder) {
        setFolderId(defaultFolder);
      }
    });
  }, []);

  return (
    <>
      <Paper
        sx={{
          minHeight: '100%',
          padding: 2,
          marginTop: 2,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 3,
            flexWrap: 'wrap',
            marginTop: 1,
            gap: 2,
          }}
        >
          <Box>
            {
            simpleSearchId &&
            <Button
              {...btnStyle['primary']}
              startIcon={icon['SEARCH']}
              disabled={data.tab == 0 ? false : data.tab == 1 && !data.edit ? true : false}
              onClick={() => {
                setSimpleSearchOpen(true);
              }}
            >
              {'SEARCH'}
            </Button>
            }
            {
              propertyId && 
              <Button
              {...btnStyle['primary']}
              startIcon={icon['ADD']}
              disabled={data.tab == 0 ? false : data.tab == 1 && !data.edit ? true : false}
              onClick={() => {
                setCreationOpen(true);
              }}
            >
              {'ADD'}
            </Button>
            }
          </Box>
        </Box>
        <DataGrid
          components={{
            NoRowsOverlay: DataNotFound,
          }}
          autoHeight={true}
          getRowHeight={() => 'auto'}
          sx={{
            backgroundColor: 'white',
            border: 'none',
            ['.MuiDataGrid-columnHeaders']: {
              backgroundColor: '#EDEDEB',
            },
            ['.MuiButtonBase-root.Mui-checked']: {
              color: '#8C8C8C',
            },
            ['.MuiDataGrid-cell']: {
              border: 'none',
              minHeight: '52px!important',
            },
            ['.MuiDataGrid-row.Mui-selected']: {
              backgroundColor: '#eaeaea',
              [':hover']: {
                backgroundColor: '#eaeaea',
              },
            },
          }}
          loading={isLoading}
          columns={columns}
          rows={rows}
          rowCount={rowCount}
          checkboxSelection
          onSelectionModelChange={(item) => {
            setRecordId(item.join(','));
          }}
          pageSize={pageSize}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          sortModel={dataGridSortModel}
        />
        <Dialog
          open={creationOpen}
          PaperProps={{
            sx: {
              padding: '40px',
              borderRadius: '20px',
              minWidth: '680px',
              maxWidth: '1000px',
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
              {'Record Creation'}
            </Typography>
            <IconButton onClick={() => setCreationOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form id="creationForm">
            <DialogContent
              sx={{
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                paddingX: 2,
              }}
            >
              {tableColumnData &&
              tableColumnData.map(({ columns, name, misPropertySectionId }) => (
                <Accordion key={misPropertySectionId} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>{name}</AccordionSummary>
                  <AccordionDetails className={styles.form}>
                    {columns
                      ?.filter((c) => c.misColumnInputType != '9')
                      .map((item) => (
                        <Controller
                          key={item.misColumnId}
                          name={item.misColumnName}
                          defaultValue={{
                            input_type: item.misColumnInputType,
                            value: '',
                          }}
                          // rules={{
                          //   required: {
                          //     value: item.misColumnAllowEmpty === 'N',
                          //     message: 'This field is required',
                          //   },
                          //   validate: {
                          //     typeChecking: (value) =>
                          //       typeChecking(
                          //         item.misColumnType,
                          //         value.value,
                          //         item.misColumnAllowEmpty === 'N'
                          //       ) as string,
                          //   },
                          //   maxLength: {
                          //     value: Number(item.misColumnLength),
                          //     message: `This field is cannot be larger than ${item.misColumnLength}`,
                          //   },
                          // }}
                          control={control}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <InputTabHandling
                                misColumnLabel={item.misColumnLabel}
                                misColumnInputType={item.misColumnInputType}
                                columnLs={item.columnLs}
                                name={item.misColumnName}
                                value={value}
                                onChange={onChange}
                                disabled={item.misColumnInputType === '5'}
                                error={error}
                                style={{
                                  gridColumn: `span ${item?.colSize}`,
                                  gridRow: `span ${item?.rowSize}`,
                                  minWidth: '150px',
                                  marginLeft:'5px',
                                  marginTop:'5px',
                                }}
                              />
                          )}
                        />
                      ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={submitTabData}>
                Submit
              </Button>
              <Button
                onClick={() => {
                  setCreationOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={simpleSearchOpen}
          onClose={() => setSimpleSearchOpen(false)}
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
              {'Simple Search'}
            </Typography>
            <IconButton onClick={() => setSimpleSearchOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <SimpleSearchPage
            tableId={data.typeId}
            searchItems={searchItems}
            simpleSearchId={simpleSearchId}
            columns={columns}
            folderId={folderId}
            onTabsChange={handleTabsChange}
          />
        </Dialog>
      </Paper>
    </>
  );
};

export default ChildRecordList;
export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

const SimpleSearchPage = ({
  tableId,
  searchItems,
  simpleSearchId,
  columns,
  folderId,
  onTabsChange,
}: {
  tableId: string;
  searchItems: SimpleSearchItem[];
  simpleSearchId: string;
  columns: GridColDef[];
  folderId: string;
  onTabsChange: (val: Map<string, any>) => void;
}) => {
  const client = useApi();
  const [tab, setTab] = useState<number>(0);
  const [jsonData, setJsonData] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [recordId, setRecordId] = useState<string>('');

  const searchData = () => {
    const myForm = document.querySelector('#myForm') as HTMLFormElement;
    const elements = myForm.querySelectorAll('input, select, textarea');
    let tabData: { [key: string]: any } = {};
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      tabData[el.name] = { input_type: 1, value: el.value };
    }
    const jsonData = JSON.stringify(tabData);
    setJsonData(jsonData);
    setTab(2);
    refetch();
  };
  const addData = () => {
    if (recordId == '') {
      toast.error('Please select at least one record to add');
      return;
    }
    const content = new Map();
    content.set(tableId, recordId);
    onTabsChange && onTabsChange(content);
  };

  useEffect(() => {
    setTab(tab);
  }, [tab]);

  const { data: simpleSearch, refetch } = useQuery(
    ['Simple Search', jsonData, page, pageSize],
    async () => {
      const { data: simpleSearchResponse } = await client.simpleSearch.simpleSearchRecord({
        folderId: folderId,
        simpleSearchId: simpleSearchId,
        data: jsonData,
        sortModel: [],
        pageState: { page: page, pageSize: pageSize },
      });
      return simpleSearchResponse;
    },
    {
      enabled: tab == 2 && jsonData != '',
      onSuccess: () => {},
    }
  );

  const simpleSearchColumns: GridColDef[] = useMemo(
    () =>
      simpleSearch?.columnList.map((item) => {
        const newItem: GridColDef = item && {
          field: item?.misColumnName,
          headerName: item?.misColumnLabel,
          valueFormatter: ({ value }) =>
            item.misColumnType === '4' ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd') : value,
          flex: 2,
          minWidth: 120,
        };
        return newItem;
      }) ?? [],
    [simpleSearch?.columnList]
  );
  const simpleSearchRows = useMemo(
    () =>
      simpleSearch?.recordList.map((item) => {
        return item
          .filter((item, index, arr) => index !== arr.length)
          .reduce(
            (prev, nex, index, arr) => ({ ...prev, [simpleSearchColumns[index].field]: nex }),
            {
              id: item[0],
            }
          );
      }) ?? [],
    [simpleSearchColumns, simpleSearch?.recordList]
  );
  const [rowCount, setRowCount] = useState(0);
  useEffect(() => {
    if (tab == 2) {
      setRowCount((prevRowCount) =>
        simpleSearch?.total !== undefined ? simpleSearch?.total : prevRowCount
      );
    }
  }, [tab, simpleSearch?.total, setRowCount]);

  const { control } = useForm({
    shouldUnregister: true,
  });

  return (
    <>
      <Paper
        sx={{
          minHeight: '100%',
          padding: 2,
          marginTop: 2,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <form id="myForm">
          <div className={styles.form}>
            {searchItems.map((item) => (
              <Controller
                key={item.id}
                name={item.itemName}
                defaultValue={{
                  input_type: item.inputType,
                  value: '',
                }}
                rules={{}}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  return (
                    <InputTabHandling
                      misColumnLabel={item.itemName}
                      misColumnInputType={item.inputType}
                      name={item.itemName}
                      columnLs={item.itemLs}
                      value={value}
                      onChange={onChange}
                      disabled={false}
                      error={error}
                      style={{
                        gridColumn: `span ${item?.colSize}`,
                        gridRow: `span ${item?.rowSize}`,
                        minWidth: '150px',
                      }}
                    />
                  );
                }}
              />
            ))}
          </div>
          <Button variant="contained" sx={{ marginTop: 2, marginBottom: 2 }} onClick={searchData}>
            Submit
          </Button>
        </form>

        <DataGrid
          autoHeight={true}
          getRowHeight={() => 'auto'}
          sx={{
            backgroundColor: 'white',
            border: 'none',
            ['.MuiDataGrid-columnHeaders']: {
              backgroundColor: '#EDEDEB',
            },
            ['.MuiButtonBase-root.Mui-checked']: {
              color: '#8C8C8C',
            },
            ['.MuiDataGrid-cell']: {
              border: 'none',
              minHeight: '52px!important',
            },
            ['.MuiDataGrid-row.Mui-selected']: {
              backgroundColor: '#eaeaea',
              [':hover']: {
                backgroundColor: '#eaeaea',
              },
            },
          }}
          columns={tab == 0 || tab == 1 ? columns : simpleSearchColumns}
          rows={tab == 0 || tab == 1 ? [] : simpleSearchRows}
          rowCount={rowCount}
          checkboxSelection
          onSelectionModelChange={(item) => {
            setRecordId(item.join(','));
          }}
          pageSize={pageSize}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          pagination
          paginationMode="server"
        />
        <Button variant="contained" sx={{ marginTop: 2, marginBottom: 2 }} onClick={addData}>
          ADD
        </Button>
      </Paper>
    </>
  );
};
