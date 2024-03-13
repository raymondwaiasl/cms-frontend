import type {
  ActivityOptionData,
  ProcessData,
  ProcessDetail,
  QfColumns,
  QfConditions,
  QueryFormDetailCrossRef,
  SimpleSearchItem,
} from '../../../api';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { DefaultFolderId } from '../../../constant';
import { WidgetContext } from '../../../context/WidgetContext';
import { useApi, useDialog, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import icon from '../../../style/icon/iconHandler';
import { InputHandling, typeChecking, InputTabHandling } from '../../../utils';
import styles from '../GridWrapper/GridWrapper.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  Badge,
  Chip,
  ToggleButtonGroup,
  // Typography,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { DataGrid, GridColDef, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
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
const ChildRecordPerViewList = () => {

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
  let isID = false
  const [tab, setTab] = useState<number>(0);
  const [recordId, setRecordId] = useState<string>('');
  // const [folderId, setFolderId] = useState<string>('');
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
      },
    }
  );
  console.log('tableColumns',tableColumns);

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
  const DeleteRelation = useMutation(client.relation.deleteRelationRec, {
    onSuccess: () => {
      refetch();
    },
  });
  const columns: GridColDef[] = useMemo(() => {
    const tmp =
      tabColumns?.columnList.map((item) => {
        const newItem: GridColDef = item && {
          field: item?.misColumnName,
          headerName: item?.misColumnLabel,
          sortable: false,
          valueFormatter: ({ value }) =>
            item.misColumnType === '4' ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd') : value,
          flex: 2,
          minWidth: 120,
        };
        return newItem;
      }) ?? [];
    return tmp;
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
    if (tabColumns) {
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
          disableSelectionOnClick
          disableColumnMenu
          // disableColumnSelector
          loading={isLoading}
          columns={!isID ? columns.filter((item) => item.headerName !== 'id') :columns}
          rows={rows}
          hideFooterPagination
          // rowCount={rowCount}
          // checkboxSelection
          // onSelectionModelChange={(item) => {
          //   setRecordId(item.join(','));
          // }}
          // pageSize={pageSize}
          // page={page}
          // onPageChange={(newPage) => setPage(newPage)}
          // onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          // rowsPerPageOptions={[10, 25, 50, 100]}
          // pagination
          // paginationMode="server"
          // sortingMode="server"
          // onSortModelChange={handleSortModelChange}
          // sortModel={dataGridSortModel}
        />
      </Paper>
    </>
  );
};

export default ChildRecordPerViewList;
export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}
