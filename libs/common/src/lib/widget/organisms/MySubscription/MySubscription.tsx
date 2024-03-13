import { DelSubscriptionMsg, UpdateSubscriptionMsg } from '../../../api';
import { useApi, useDialog } from '../../../hooks';
import { Button, Paper } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useCallback, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { useMutation, useQuery } from 'react-query';

const MySubscription = () => {
  const { openDialog } = useDialog();
  const client = useApi();
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

  const columns: GridColDef[] = [
    {
      field: 'misSubscriptionMsgId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'misFolderName',
      headerName: 'Name',
      minWidth: 200,
    },
    {
      field: 'misSubscriptionType',
      headerName: 'Type',
      minWidth: 200,
    },
    {
      field: 'misSubEventMsg',
      headerName: 'Message',
      minWidth: 200,
    },
    {
      field: 'misSubscriptionMsgDate',
      headerName: 'Date Time',
      minWidth: 200,
      //valueFormatter: (params) => DateTime.fromFormat(params.value, 'DD/MM/YYYY HH:mm:ss'),
    },
    {
      field: 'action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      width: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Message',
                  message: `Are you sure to delete this subscription message?`,
                  confirmAction: () => deleteMsg.mutate({ msgId: props.id as string }),
                });
              }}
            >
              Delete
            </Button>
          </>
        );
      },
    },
  ];

  const { data: subscriptData } = useQuery(
    ['subscription msg', { sortingOptions, page, pageSize }],
    async () => {
      const { data: subscriptData } = await client.subscription.getSubscriptionMsg({
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return subscriptData;
    }
  );

  const deleteMsg = useMutation(
    (data: DelSubscriptionMsg) => client.subscription.delSubscriptionMsg(data),
    {
      onSuccess: () => {},
    }
  );

  const updateMsg = useMutation(
    (data: UpdateSubscriptionMsg) => client.subscription.updateSubscriptionMsgRead(data),
    {
      onSuccess: () => {},
    }
  );

  // once row click, set msg status => has read
  const handleRowClick = (params: any) => {
    if (params.row.misSubscriptionMsgHasRead !== 'Y') {
      const msgId = params.row.misSubscriptionMsgId;
      updateMsg.mutate({ msgId });
    }
  };

  return (
    <DataGrid
      autoHeight
      sx={{
        backgroundColor: 'white',
        border: 'none',
        ['.MuiDataGrid-columnHeaders']: {
          backgroundColor: '#e2e9e4',
        },
        ['.MuiButtonBase-root.Mui-checked']: {
          color: '#577267',
        },
        ['.MuiDataGrid-cell']: {
          border: 'none',
        },
        ['.MuiDataGrid-row.Mui-selected']: {
          backgroundColor: 'rgba(226, 233, 228,0.4)',
          [':hover']: {
            backgroundColor: 'rgba(226, 233, 228,0.5)',
          },
        },
      }}
      rows={subscriptData?.data ?? []}
      rowCount={subscriptData?.total ?? 0}
      disableColumnMenu
      pagination
      paginationMode="server"
      sortingMode="server"
      onSortModelChange={handleSortModelChange}
      getRowId={(row) => row.misSubscriptionMsgId}
      columns={columns}
      page={page}
      pageSize={pageSize}
      rowsPerPageOptions={[5, 10, 25]}
      onPageChange={(newPage) => setPage(newPage)}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      // set row has read style
      onRowClick={handleRowClick}
      getRowClassName={(params) => {
        if (params.row.misSubscriptionMsgHasRead === 'Y') {
          return 'hasRead';
        }
        return '';
      }}
    />
  );
};

export default MySubscription;
