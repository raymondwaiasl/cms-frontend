import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const WidgetMgmt = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const history = useHistory();
  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { errors },
  // } = useForm({ mode: 'onSubmit' });
  const client = useApi();

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState({
    field: '',
    sort: '',
  });
  // const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: widgetData } = useQuery(
    [
      'widget Mgmt',
      {
        pageState: { page: page + 1, pageSize },
        sortModel,
      },
    ],
    async () => {
      const { data } = await client.widget.getWidgetListByPage({
        pageState: { page: page + 1, pageSize },
        sortModel,
      });
      return data;
    }
  );

  const DeleteWidget = useMutation(client.widget.deleteWidget, {
    onSuccess: () => {
      queryClient.invalidateQueries('widget Mgmt');
    },
  });

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

  const columns: GridColDef[] = [
    { field: 'misWidgetId', headerName: 'S/N', flex: 1, minWidth: 150 },
    {
      field: 'misWidgetName',
      headerName: 'Widget Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'misBasicWidget',
      headerName: 'Basic Widget',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'misWidgetConfig',
      headerName: 'Widget Config',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'misWidgetType',
      headerName: 'Widget Type',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Action',
      headerName: 'Action',
      sortable: false,
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() =>
                history.push({
                  pathname: '/widgetMgmt/detail',
                  search: `?id=${props.id}`,
                })
              }
            >
              Edit
            </Button>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'delete Widget',
                  message: `Are you sure to delete ${props.row.misWidgetId}`,
                  confirmAction: () => DeleteWidget.mutate({ id: props.id as string }),
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
    <>
      <Typography variant="h5">Widget Management</Typography>
      <Button
        variant="contained"
        sx={{ marginY: 1 }}
        onClick={() => history.push(route.widgetMgmtDetail)}
      >
        Create New
      </Button>
      <Paper>
        <DataGrid
          autoHeight
          rows={widgetData?.data ?? []}
          rowCount={widgetData?.total ?? 0}
          pagination
          experimentalFeatures={{ newEditingApi: true }}
          getRowId={(row) => row.misWidgetId}
          columns={columns}
          page={page}
          paginationMode="server"
          sortingMode="server"
          pageSize={pageSize}
          onSortModelChange={handleSortChange}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </Paper>
    </>
  );
};

export default WidgetMgmt;
