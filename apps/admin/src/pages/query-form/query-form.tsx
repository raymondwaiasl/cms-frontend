import { Button, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useApi } from 'libs/common/src/lib/hooks';
import { useDialog } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaEdit } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const QueryForm = () => {
  const client = useApi();
  const queryClient = useQueryClient();
  const columns: GridColDef[] = [
    {
      field: 'misQfId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'misQfName',
      headerName: 'Query Form Name',
      minWidth: 300,
    },
    {
      field: 'tableLabel',
      headerName: 'Query on Table',
      minWidth: 300,
    },
    {
      field: 'Action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      width: 300,
      renderCell: (params: any) => {
        return (
          <div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FaEdit />}
              onClick={() => {
                queryFormDetail(params.row.misQfId);
              }}
              color="primary"
              sx={{
                marginRight: 1,
              }}
            >
              Edit
            </Button>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Query Form',
                  message: `Are you sure to delete ${params.row.misQfName}`,
                  confirmAction: () => DeleteQueryForm.mutate({ id: params.row.misQfId }),
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
  const { openDialog } = useDialog();
  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

  const createNew = () => {
    history.push('/queryform/detail');
  };

  const queryFormDetail = (misQfId: string) => {
    history.push(`/queryform/detail?id=${misQfId}`);
  };
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
  const { data: pageData, isLoading } = useQuery(['Query Form', pageState, sortModel], async () => {
    const { data: response } = await client.queryForm.getQueryFormPageable({
      pageState,
      sortModel,
    });
    return response;
  });
  const DeleteQueryForm = useMutation(client.queryForm.deleteQueryFormById, {
    onSuccess: () => {
      queryClient.invalidateQueries('Query Form');
    },
  });

  return (
    <div>
      <Typography variant="h5">Query Form</Typography>
      <Button variant="contained" sx={{ my: 1 }} onClick={createNew}>
        Create Query Form
      </Button>

      <DataGrid
        autoHeight
        rows={pageData?.data ?? []}
        rowCount={pageData?.total ?? 0}
        loading={isLoading}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={pageState.page - 1}
        pageSize={pageState.pageSize}
        paginationMode="server"
        onPageChange={(newPage) => {
          setPageState((old) => ({ ...old, page: newPage + 1 }));
        }}
        onPageSizeChange={(newPageSize) =>
          setPageState((old) => ({ ...old, pageSize: newPageSize }))
        }
        columns={columns}
        disableColumnMenu
        sortingMode="server"
        onSortModelChange={handleSortChange}
        getRowId={(row) => row.misQfId}
      />
    </div>
  );
};

export default QueryForm;
