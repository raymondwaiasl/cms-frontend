import type {
  ActivityOptionData,
  GetTableData,
  ProcessData,
  ProcessDetail,
  QfColumns,
  QfConditions,
  QueryFormDetailCrossRef,
} from '../../../api';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { DefaultFolderId } from '../../../constant';
import { useApi, useDialog, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import btnStyle from '../../../style/btnStyle';
import icon from '../../../style/icon/iconHandler';
import { WidgetProps } from '../../type';
import { yupResolver } from '@hookform/resolvers/yup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  InputAdornment,
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
  Typography,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import { GridLinkOperator } from '@mui/x-data-grid';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { SortModel } from 'libs/common/src/lib/api/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { AiFillFolderOpen, AiOutlineDelete } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { BiEdit } from 'react-icons/bi';

const HADRecordList = () => {
  const client = useApi();
  const { openDialog } = useDialog();
  // const store = useRecoilValue(dataStore);
  const { data, updateWidget, updateWidgets, config } = useWidget<
    {
      nodeId: string;
    },
    RecordListProps
  >('HAD Record List');
  const { openOverlay } = useOverlay();
  useEffect(() => {
    if (config.misDefaultTable) {
      setTypeId(config.misDefaultTable);
      updateWidget('Data Export', { id: config.misDefaultTable });
    }
  }, [config.misDefaultTable]);
  const queryClient = useQueryClient();
  const [typeId, setTypeId] = useState<string>('');
  const [tab, setTab] = useState<number>(0);
  const [recordId, setRecordId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchRecordInput, setSearchRecordInput] = useState<string>('');
  const [propertyId, setPropertyId] = useState<string>('');
  const open = Boolean(anchorEl);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
  });

  useQuery(
    'showRecordId',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'showRecordId',
      });
      return response;
    },

    {
      enabled: true,
      onSuccess: (data) => {
        console.log(data?.misSysConfigKey + '========' + data?.misSysConfigValue);

        setColumnVisibilityModel({
          id: data?.misSysConfigValue === 'true' ? true : false,
        });
      },
    }
  );
  useQuery(
    ['defaultTableId', config.misWidgetId],
    async () => {
      const { data: searchResponse } = await client.widget.getWidgetById({
        id: config.misWidgetId ?? '',
      });
      return searchResponse;
    },
    {
      onSuccess: (result) => {
        console.log("result===",result)
        if (null != result) {
          if (null != result.misWidgetConfig) {

            var obj = JSON.parse(result.misWidgetConfig);
            console.log("result obj===",obj.propertyId)
            setPropertyId(obj.propertyId as string);
          }
        }
      },
    }
  );

  const editTableRef = useRef([{}]);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setExcludeList(userData.map((item) => ({ ...item, type: '4', checked: false })));
  };

  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const [dataGridSortModel, setDataGridSortModel] = useState<GridSortItem[]>([]);

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(
      newSortModel.map((item) => ({
        field: item.field || '',
        sort: item.sort || '',
      }))
    );
    setDataGridSortModel(newSortModel);
  }, []);

  const { data: simpleSearch, isLoading: isSimpleSearchLoading } = useQuery(
    ['HAD Record List', data?.nodeId, sortModel, page, pageSize, tab],
    async () => {
      const { data: simpleSearchResponse } = await client.simpleSearch.getHADRecord({
        nodeId: data?.nodeId ?? 'a1',
        sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return simpleSearchResponse;
    },
    {
      enabled: !!data?.nodeId,
      onSuccess: () => {
        // updateTab(1);
        // updateWidget('Data Export', { misQfTableId: data?.searchParams?.typeId });
      },
    }
  );

  const renderHyperlinkCell = (params: GridRenderCellParams<any, any, any>) => {
    let issuer = '';
    let url = '';
    let openMethod = '';
    let valid = false;
    let target = '_blank';
    let openMethodMap: { [key: string]: string } = {
      '1': 'newwindow',
      '2': '_blank',
      '3': '_parent',
    };
    let features: string = '';
    try {
      const obj = JSON.parse(params.value);
      issuer = obj.issuer;
      url = obj.url;
      openMethod = obj.openMethod;
      target = openMethodMap[openMethod] || target;
      if (issuer && url && openMethod) {
        valid = true;
      }
      if (target === 'newwindow') {
        features = 'width=600,height=400';
      }
    } catch (error) { }

    if (!valid) {
      return <></>;
    }

    return (
      <Button
        size="small"
        endIcon={<OpenInNewIcon />}
        color={'inherit'}
        onClick={(e) => {
          window.open(url, target, features);
          // e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        {issuer}
      </Button>
    );
  };
  const renderRepeatingFieldCell = (params: GridRenderCellParams<any, any, any>) => {
    const values: Array<string> = [];
    if (params.value) {
      try {
        const parse = JSON.parse(params.value);
        if (parse instanceof Array) {
          (parse as Array<string>).forEach((s) => values.push(s));
        }
      } catch (err) { }
    }
    return (
      <List
        dense={true}
        sx={{ ['& .MuiListItem-root']: { paddingLeft: '4px', paddingRight: '0px' } }}
        // direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        component={Stack}
      >
        {values.map((v) => {
          return (
            <ListItem>
              <Chip label={v} variant="outlined" />
            </ListItem>
          );
        })}
      </List>
    );
  };

  const simpleSearchColumns: GridColDef[] = useMemo(
    () =>
      simpleSearch?.columnList.map(
        (item) =>
          item && (item?.misColumnName !== 'Action' ? {
            field: item?.misColumnName ?? item?.misColumnLabel,
            headerName: item?.misColumnLabel,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
            flex: item?.misColumnWidth,
            minWidth: 120,
          } : {
            field: 'Action',
            headerName: 'Action',
            minWidth: 120,
            flex: 1,
            type: 'actions',
            headerAlign: 'left',
            renderCell: (props: GridRenderCellParams) => {
              return (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BiEdit />}
                    onClick={() => {
                      console.log('param>>>>>>>>>>>>>>>>>', props.id)
                      const idStr: string = props.id as string;
                      const ids: string[] = idStr.split('-');
                      updateWidgets({
                        Properties: {
                          typeId: ids[1],
                          recordId: ids[0],
                          propertyId: propertyId,
                          isDraft: 'yes',
                        },
                      });
                      openOverlay({
                        key: 'Properties',
                        type: 'SIDEBAR',
                        data: {
                          typeId: ids[1],
                          recordId: ids[0],
                          propertyId: propertyId,
                          isDraft: 'yes',
                        },
                      });
                    }}
                  >
                    EDIT
                  </Button>
                  <Button
                    startIcon={<AiOutlineDelete />}
                    variant="outlined"
                    size="small"
                    color="error"
                    sx={{ marginLeft: (theme) => theme.spacing(1) }}
                    onClick={() => {
                      const idStr: string = props.id as string;
                      const ids: string[] = idStr.split('-');
                      openDialog('deleteDialog', {
                        title: 'Delete Context',
                        message: `Are you sure to delete ${props.row.misPropertyName}`,
                        confirmAction: () => DeleteDraft.mutate({
                          tableId: ids[1],
                          recordId: ids[0],
                        }),
                      });
                    }}
                  >
                    DELETE
                  </Button>
                </>
              );
            },
          })
      ) ?? [],
    [simpleSearch?.columnList]
  );

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {simpleSearchColumns.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
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
    setRowCount((prevRowCount) =>
      simpleSearch?.total !== undefined ? simpleSearch?.total : prevRowCount
    );
  }, [simpleSearch?.total, setRowCount]);

  const updateTab = (tab: number) => {
    updateWidget('Record List', { tab });
    setTab(tab);
  };

  useEffect(() => {
    client.folderService.getDefaultFolder().then((res) => {
      const defaultFolder = res.data;
      console.log(defaultFolder);
      if (defaultFolder) {
        updateWidget('Record List', { id: defaultFolder.misFolderId });
      }
    });
  }, []);

  const actionHandler = ({
    key,
    type,
    configId,
  }: {
    key: availableBtn;
    type?: 'SIDEBAR' | 'DIALOG';
    configId?: string;
  }) => {
    console.log(key);
    switch (key) {
      case 'SEARCH':
        return openOverlay({
          key: 'Search Form',
          type: type || 'SIDEBAR',
          data: { id: data?.nodeId },
          configId,
        });
      case 'Create':
        return openOverlay({
          key: 'Record Creation',
          type: type || 'DIALOG',
          data: {
            id: data?.nodeId,
            tableId: data?.nodeId,
          },
          configId,
        });
      case 'EXPORT':
        return openOverlay({ key: 'Data Export', type: type || 'DIALOG', configId });
    }
  };

  const DeleteDraft = useMutation(client.recordService.deleteDraftProperties, {
    onSuccess: () => {
      queryClient.invalidateQueries('Workflow Tree View');
      queryClient.invalidateQueries('HAD Record List');
      queryClient.invalidateQueries('HAD View Change');
    },
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
        {config?.config?.btn?.main && (
          <Button
            {...btnStyle[config?.config?.btn?.main.theme ?? 'primary']}
            startIcon={icon[config?.config?.btn?.main.name as keyof typeof icon]}
            onClick={() => {
              actionHandler({
                key: config?.config?.btn?.main?.name as availableBtn,
                configId: config?.config?.btn?.main?.configId,
              });
            }}
          >
            {config?.config?.btn?.main.name[0].toUpperCase() +
              config?.config?.btn?.main.name.substring(1).toLowerCase()}
          </Button>
        )}
        {/* <Button
          {...btnStyle.primary}
          sx={{ ...btnStyle.primary.sx, marginBottom: '20px' }}
          startIcon={<SearchIcon />}
          onClick={() => {
            openOverlay({ key: 'Search Form', type: 'SIDEBAR', data: { folderId } });
          }}
        >
          Search
        </Button> */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 3,
            flexWrap: 'wrap',
            marginTop: config?.config?.btn?.main ? 1 : 0,
            gap: 2,
          }}
        >
          <Box
            sx={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center' }}
          ></Box>
          <Box>
            {config?.config?.btn?.right &&
              config.config.btn.right.slice(0, 2).map((item, index) => (
                <Button
                  {...btnStyle[item.theme]}
                  startIcon={icon[item.name as keyof typeof icon]}
                  onClick={() => {
                    actionHandler({ key: item.name as availableBtn, configId: item.configId });
                  }}
                >
                  {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                </Button>
              ))}
            {config?.config?.btn?.right && config?.config?.btn?.right.length > 3 && (
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {config.config.btn.right.slice(2).map((item, index) => (
                  <MenuItem
                    key={item.configId}
                    onClick={() => {
                      actionHandler({ key: item.name as availableBtn, configId: item.configId });
                      handleClose();
                    }}
                  >
                    {icon[item.name as keyof typeof icon]}
                    {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
        </Box>
        <DataGrid
          filterModel={{
            items: [],
            quickFilterValues: searchRecordInput.split(','),
            quickFilterLogicOperator: GridLinkOperator.Or,
          }}
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
          loading={isSimpleSearchLoading}
          columns={simpleSearchColumns}
          rows={simpleSearchRows}
          rowCount={rowCount}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          checkboxSelection
          onSelectionModelChange={(item) => {
            setRecordId(item.join(','));
          }}
          onRowClick={(param) => {
            if (data?.nodeId !== 'a6') {
              updateWidgets({
                // Properties: {
                //   // ...store['Properties'],
                //   typeId: simpleSearch?.tableId,
                //   recordId: param.row.id,
                // },
                'HAD View Change': {
                  workflowId: param.row.id,
                  workflowStatus: data?.nodeId ?? '',
                },
              });
            }

            // openOverlay({
            //   key: 'Properties',
            //   type: 'SIDEBAR',
            //   data: {
            //     typeId: simpleSearch?.tableId,
            //     recordId: param.row.id,
            //   },
            // });
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
        {/* <CustomFooter /> */}
      </Paper>
    </>
  );
};

export default HADRecordList;
export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

export type RecordListProps = {
  row: {
    click: {
      showOverlay: boolean;
    };
  };
  default: {
    folderId: string;
  };
} & WidgetProps<btnProps>;

type btnProps = {
  name: availableBtn;
  configId: string;
  theme: btnTheme;
};

type availableBtn = 'SEARCH' | 'Create' | 'EXPORT';

type btnTheme = 'primary' | 'secondary' | 'danger';
