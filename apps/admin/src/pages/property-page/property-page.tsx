import { Button, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useCallback, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const PropertyPage = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const client = useApi();
  const history = useHistory();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
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
  const { data: propertyData } = useQuery(
    ['property page', { sortingOptions, page, pageSize }],
    async () => {
      const { data: propertyData } = await client.property.getPropretyPageListPageable({
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return propertyData;
    }
  );
  const DeleteProperty = useMutation(client.property.deletePropertyById, {
    onSuccess: () => {
      queryClient.invalidateQueries('property page');
    },
  });

  const columns: GridColDef[] = [
    { field: 'misPropertyId', headerName: 'S/N', minWidth: 150, flex: 1 },
    {
      field: 'misPropertyName',
      headerName: 'Property Page',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'tableLabel',
      headerName: 'Table Label',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'Action',
      headerName: 'Action',
      minWidth: 250,
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
              onClick={() =>
                history.push({
                  pathname: route.propertyPageDetail,
                  search: `?id=${props.id}`,
                })
              }
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
                openDialog('deleteDialog', {
                  title: 'Delete Context',
                  message: `Are you sure to delete ${props.row.misPropertyName}`,
                  confirmAction: () => DeleteProperty.mutate({ id: props.id as string }),
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

  return (
    <div>
      <Typography variant="h5">Property Page</Typography>
      <Button
        variant="contained"
        sx={{ my: 1 }}
        onClick={() => history.push(route.propertyPageDetail)}
      >
        Create Property
      </Button>

      <Paper
        sx={{
          height: '100%',
          '& .MuiDataGrid-cell--editing': {
            bgcolor: 'rgb(255,215,115, 0.19)',
            color: '#1a3e72',
            '& .MuiInputBase-root': {
              height: '100%',
            },
          },
          '& .Mui-error': {
            bgcolor: (theme) => `rgb(126,10,15, ${theme.palette.mode === 'dark' ? 0 : 0.1})`,
            color: (theme) => (theme.palette.mode === 'dark' ? '#ff4343' : '#750f0f'),
          },
        }}
      >
        <DataGrid
          autoHeight
          rows={propertyData?.data ?? []}
          rowCount={propertyData?.total ?? 0}
          disableColumnMenu
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          experimentalFeatures={{ newEditingApi: true }}
          getRowId={(row) => row.misPropertyId}
          columns={columns}
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </Paper>
    </div>
  );
};

export default PropertyPage;
