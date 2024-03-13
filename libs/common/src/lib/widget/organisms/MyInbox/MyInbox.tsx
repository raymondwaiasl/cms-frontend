import { AcquireTaskInput } from '../../../api/myInboxList';
import { useApi, useWidget } from '../../../hooks';
import { Paper, styled } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .noRead': {
    fontWeight: 'bold',
  },
}));

const MyInbox = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { updateWidgets } = useWidget();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });

  const [userList, setUserList] = useState<User[]>([]);

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
    // { field: 'workflowActivityId', headerName: 'S/N', flex: 1, minWidth: 150 },
    {
      field: 'wfActivityName',
      headerName: 'Task Name',
      minWidth: 150,
    },
    {
      field: 'wfWorkflowName',
      headerName: 'Workflow Name',
      minWidth: 300,
    },
    // {
    //   field: 'misTypeLabel',
    //   headerName: 'Record',
    //   minWidth: 150,
    // },
    {
      field: 'performer',
      headerName: 'Sent By',
      minWidth: 150,
      valueGetter: getFullName,
    },
    {
      field: 'sentDate',
      headerName: 'Sent Date',
      minWidth: 150,
      valueFormatter: ({ value }) =>
        value != null ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd hh:mm') : '',
    },
    // {
    //   field: 'misSubEventMsg',
    //   headerName: 'Message',
    //   minWidth: 200,
    // },
    // {
    //   field: 'misSubscriptionMsgDate',
    //   headerName: 'Date Time',
    //   minWidth: 200,
    //   //valueFormatter: (params) => DateTime.fromFormat(params.value, 'DD/MM/YYYY HH:mm:ss'),
    // },
    // {
    //   field: 'action',sortable:false,
    //   headerName: 'Action',
    //   type:'actions', headerAlign:'left',
    //   width: 200,
    //   renderCell: (props: GridRenderCellParams) => {
    //     return (
    //       <>
    //         <Button
    //           startIcon={<AiOutlineDelete />}
    //           variant="outlined"
    //           size="small"
    //           color="error"
    //           sx={{ marginLeft: (theme) => theme.spacing(1) }}
    //           onClick={() => {
    //             openDialog('deleteDialog', {
    //               title: 'Delete Message',
    //               message: `Are you sure to delete this subscription message?`,
    //               confirmAction: () => deleteMsg.mutate({ msgId: props.id as string }),
    //             });
    //           }}
    //         >
    //           DELETE
    //         </Button>
    //       </>
    //     );
    //   },
    // },
  ];
  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setUserList(userData.map((item) => ({ ...item, checked: false })));
  };
  function getFullName(params: any) {
    const userId = params.row.performer;
    return userList.filter((item) => item.id == userId)[0]?.name;
  }

  const { data } = useQuery(['myInbox', { sortingOptions, page, pageSize }], async () => {
    const { data } = await client.myInbox.getMyInboxListByUserId({
      pageState: { page: page + 1, pageSize },
      sortModel: sortingOptions,
    });
    console.log('myInbox===', data);
    return data;
  });

  const acquireTask = useMutation((data: AcquireTaskInput) => client.myInbox.acquireTask(data), {
    onSuccess: () => {
      queryClient.invalidateQueries('myInbox');
      queryClient.invalidateQueries('myOutbox');
    },
  });

  // once row click, set msg status => has read
  const handleRowClick = (params: any) => {
    const wfIdTemp = params.row.workflowId;
    const wfaIdTemp = params.row.workflowActivityId;
    const userIdTemp = params.row.userId;
    console.log('myinbox workflowId=======', wfIdTemp);
    updateWidgets({
      'Task Comment': { workflowId: wfIdTemp, workflowActivityId: wfaIdTemp, userId: userIdTemp },
      'Task Detail': { workflowId: wfIdTemp, workflowActivityId: wfaIdTemp, userId: userIdTemp },
    });
    if (params.row.wfWorkflowActivityStatus === 'N') {
      const wfaId = params.row.workflowActivityId;
      const userId = params.row.userId;
      // const aDate = '22-04-2023 09:50:10';
      const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
      acquireTask.mutate({
        workflowId: wfIdTemp,
        workflowActivityId: wfaId,
        userId: userId,
        acquireDate: aDate,
      });
    }
  };

  return (
    <Paper
      sx={{
        height: '100%',
        backgroundColor: 'white',
        padding: '10px',
        overflowY: 'auto',
        borderRadius: '12px',
      }}
    >
      {/* <Typography variant="h5">Activity{data?.total}</Typography> */}
      <StyledDataGrid
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
        rows={data?.data ?? []}
        rowCount={data?.total ?? 0}
        disableColumnMenu
        pagination
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        getRowId={(row) => row['workflowActivityId']}
        columns={columns}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        // set row has read style
        onRowClick={handleRowClick}
        getRowClassName={(params) => {
          if (params.row['wfWorkflowActivityStatus'] === 'N') {
            return 'noRead';
          }
          return '';
        }}
      />
    </Paper>
  );
};

export default MyInbox;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
