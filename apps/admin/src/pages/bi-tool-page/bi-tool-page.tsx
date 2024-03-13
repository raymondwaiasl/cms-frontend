import { Button } from '@mui/material';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { useDialog, useApi } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiShow } from 'react-icons/bi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const BiToolPage = () => {
  const client = useApi();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();

  const biToolColumns: GridColDef[] = [
    {
      field: 'misBiConfigId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'misBiConfigName',
      headerName: 'Widget Name',
      minWidth: 200,
    },
    {
      field: 'misBiConfigTypeName',
      headerName: 'Table',
      minWidth: 200,
    },
    {
      field: 'misBiConfigGraphicType',
      headerName: 'Graphics Type',
      minWidth: 200,
    },
    {
      field: 'misBiConfigDate',
      headerName: 'Creation Date',
      minWidth: 200,
    },
    {
      field: 'Action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiShow />}
              onClick={() => {
                biToolsDetail(props.row.misBiConfigId);
              }}
              color="primary"
            >
              Edit
            </Button>{' '}
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Bi Tool',
                  message: `Are you sure to delete ${props.row.misBiConfigName}`,
                  confirmAction: () =>
                    deleteBiTool.mutate({ misBiConfigId: props.row.misBiConfigId as string }),
                });
              }}
            >
              DELETE
            </Button>
          </>
        );
      },
    },
  ];

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState({ field: '', sort: '' });

  const handleSortChange = (newSortModel: any) => {
    if (JSON.stringify(sortModel) !== JSON.stringify(newSortModel[0])) {
      if (newSortModel.length > 0) {
        setSortModel((old) => ({
          ...old,
          field: newSortModel[0].field,
          sort: newSortModel[0].sort,
        }));
      }
    }
  };

  const { data: biToolData, isLoading } = useQuery(
    ['biToolQuery', pageState, sortModel],
    async () => {
      const { data: response } = await client.biTool.getAllBiToolByPage({
        pageState,
        sortModel,
      });
      return response;
    }
  );

  // const { data: biToolData2 } = useQuery(
  //   ['biToolAll', pageState, sortModel],
  //   async () => {
  //     const { data: response } = await client.biTool.getAllBiTool();
  //     return response;
  //   }
  // );

  const deleteBiTool = useMutation(client.biTool.delBiTool, {
    onSuccess: () => {
      queryClient.invalidateQueries(['biToolQuery', pageState, sortModel]);
    },
  });

  const biToolsDetail = (misBiConfigId: string) => {
    history.push({
      pathname: route.biToolDetail,
      search: `?id=${misBiConfigId}`,
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{ my: 1 }}
        onClick={() => {
          history.push(route.biToolDetail);
        }}
      >
        Create New
      </Button>
      <DataGrid
        autoHeight
        rows={biToolData?.data ?? []}
        loading={isLoading}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={pageState.page - 1}
        pageSize={pageState?.pageSize ?? 0}
        paginationMode="server"
        columns={biToolColumns}
        disableColumnMenu
        onPageChange={(newPage) => {
          setPageState((old) => ({ ...old, page: newPage + 1 }));
        }}
        onPageSizeChange={(newPageSize) =>
          setPageState((old) => ({ ...old, pageSize: newPageSize }))
        }
        sortingMode="server"
        onSortModelChange={handleSortChange}
        getRowId={(row) => row.misBiConfigId}
      />
    </div>
  );
};

export default BiToolPage;
