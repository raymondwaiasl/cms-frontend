import { Button, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import btnStyle from 'libs/common/src/lib/style/btnStyle';
import { useCallback, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const ContextPage = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const columns: GridColDef[] = [
    {
      field: 'misContextId',
      headerName: 'S/N',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'misContextName',
      headerName: 'Context Name',
      minWidth: 300,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <Link
            aria-label="context-link"
            component="button"
            variant="body2"
            onClick={() => {
              contextDetail(params.row.misContextId);
            }}
          >
            {params.row.misContextName}
          </Link>
        );
      },
    },
    {
      field: 'misRoleName',
      headerName: 'Assign to Role',
      minWidth: 300,
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <div>
            <Button
              {...btnStyle['secondary-small']}
              variant="outlined"
              size="small"
              aria-label=""
              startIcon={<BiEdit />}
              onClick={() => {
                contextDetail(params.row.misContextId);
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
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Context',
                  message: `Are you sure to delete ${params.row.misContextName}`,
                  confirmAction: () => DeleteContext.mutate({ id: params.row.misContextId }),
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
  const history = useHistory();
  const client = useApi();

  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const createNew = () => {
    history.push(route.contextDetail);
  };

  const contextDetail = (misContextId: string) => {
    history.push({
      pathname: route.contextDetail,
      search: `?id=${misContextId}`,
    });
  };

  const DeleteContext = useMutation(client.context.deleteContextById, {
    onSuccess: () => {
      queryClient.invalidateQueries('context');
    },
  });

  const handleSortModelChange = useCallback((sortModel: any) => {
    // Here you save the data you need from the sort model
    const [options] = sortModel;
    setSortingOptions(
      options ?? {
        field: '',
        sort: '',
      }
    );
  }, []);

  const {
    data: contextData,
    isLoading,
    isRefetching,
  } = useQuery(['context', page, pageSize, sortingOptions], async () => {
    const { data: response } = await client.context.getContextListPageable({
      pageState: { page: page + 1, pageSize },
      sortModel: sortingOptions,
    });
    return response;
  });

  console.log(contextData);

  return (
    <div>
      <Typography variant="h5">Context Management</Typography>
      <Button variant="contained" sx={{ my: 1 }} onClick={createNew} data-cy="create_context">
        Create Context
      </Button>

      <DataGrid
        autoHeight
        rows={contextData?.data ?? []}
        rowCount={contextData?.total}
        loading={isLoading || isRefetching}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        columns={columns}
        disableColumnMenu
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        getRowId={(row) => row.misContextId}
      />
    </div>
  );
};

export default ContextPage;

export interface pageDataIntf {
  misContextId: string;
  misContextName: string;
  misRoleName: string;
}
