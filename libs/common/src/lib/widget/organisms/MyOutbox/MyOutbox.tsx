import { WithdrawWorkflowInput } from '../../../api/myInboxList';
import { useApi, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .noRead': {
    fontWeight: 'bold',
  },
}));

const MyOutbox = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { updateWidgets } = useWidget();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });

  const [wfName, setWfName] = useState('');
  const [wfId, setWfId] = useState('');
  const [actName, setActName] = useState('');
  const [actId, setActId] = useState('');
  const [perName, setPerName] = useState('');
  const [perId, setPerId] = useState('');
  const [withdrawComment, setWithdrawComment] = useState('');

  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
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
      minWidth: 200,
    },
    {
      field: 'wfWorkflowName',
      headerName: 'Workflow Name',
      minWidth: 300,
    },
    // {
    //   field: 'misTypeLabel',
    //   headerName: 'Record',
    //   minWidth: 100,
    // },
    {
      field: 'performer',
      headerName: 'Sent By',
      minWidth: 100,
      valueGetter: getFullName,
    },
    {
      field: 'sentDate',
      headerName: 'Sent Date',
      minWidth: 100,
      valueFormatter: ({ value }) =>
        value != null ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd') : '',
    },
    {
      field: 'wfWorkflowActivityStatus',
      headerName: 'My Action',
      minWidth: 100,
      valueGetter: (param) =>
        param.row.wfWorkflowActivityStatus === 'R'
          ? 'Rejected'
          : param.row.wfWorkflowActivityStatus === 'P'
          ? 'Approved'
          : 'Delegated',
    },
  ];

  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setUserList(userData.map((item) => ({ ...item, checked: false })));
  };

  const { data } = useQuery(['myOutbox', { sortingOptions, page, pageSize }], async () => {
    const { data } = await client.myInbox.getMyOutboxListByUserId({
      pageState: { page: page + 1, pageSize },
      sortModel: sortingOptions,
    });
    console.log('myOutbox===', data);
    return data;
  });

  const withdrawWorkflow = useMutation(
    (data: WithdrawWorkflowInput) => client.myInbox.withdrawWorkflow(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myInbox');
        queryClient.invalidateQueries('myOutbox');
      },
      onError: (error: any) => {
        console.log('error===========', error.data);
        toast(error.data, {
          type: 'error',
        });
      },
    }
  );

  function getFullName(params: any) {
    const userId = params.row.performer;
    return userList.filter((item) => item.id == userId)[0]?.name;
  }

  // once row click, set msg status => has read
  const handleRowClick = (params: any) => {
    const wfIdTemp = params.row.workflowId;
    const wfaIdTemp = params.row.workflowActivityId;
    const userIdTemp = params.row.userId;
    console.log('wfid=======', wfIdTemp);
    console.log('userIdTemp=======', userIdTemp);
    updateWidgets({
      'Task Comment': { workflowId: wfIdTemp, workflowActivityId: wfaIdTemp, userId: userIdTemp },
    });
    const userId = params.row.userId;
    for (let u of userList) {
      if (u.id === userId) {
        setPerName(u.name);
      }
    }
    setWfId(params.row.workflowId);
    setWfName(params.row.wfWorkflowName);
    setActId(params.row.workflowActivityId);
    setActName(params.row.wfActivityName);
    setPerId(params.row.userId);
  };

  const handleWithdraw = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    withdrawWorkflow.mutate({
      workflowId: wfId,
      userId: perId,
      withdrawDate: aDate,
      comment: withdrawComment,
    });
  };

  return (
    <>
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
        <Stack direction="row" spacing={2} mb={3} mt={3}>
          <Button
            {...btnStyle.primary}
            sx={{ float: 'right', textTransform: 'none' }}
            onClick={() => {
              if (wfId !== '') {
                setIsWithdrawDialogOpen(true);
              }
            }}
          >
            Withdraw
          </Button>
        </Stack>
      </Paper>
      <Dialog open={isWithdrawDialogOpen}>
        <DialogTitle>Withdraw Workflow</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            paddingTop: 3,
          }}
        >
          <Stack direction="row" spacing={2} mb={3} mt={3}></Stack>
          <Typography variant="subtitle1">Workflow name：{wfName}</Typography>
          <br />
          <Typography variant="subtitle1">Activity name：{actName}</Typography>
          <br />
          <Typography variant="subtitle1">Performer：{perName}</Typography>

          <Stack direction="row" spacing={6} mb={3} mt={3}></Stack>

          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <TextField
              id="withdrawComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={4}
              defaultValue=""
              onChange={(evt) => setWithdrawComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            {...btnStyle.primary}
            sx={{ textTransform: 'none' }}
            onClick={() => {
              handleWithdraw();
              setIsWithdrawDialogOpen(false);
            }}
          >
            Submit
          </Button>
          <Button
            {...btnStyle}
            onClick={() => {
              setIsWithdrawDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyOutbox;
export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
