import {
  ApproveTaskInput,
  DelegateTaskInput,
  RejectTaskInput,
  TerminateWorkflowInput,
} from '../../../api/myInboxList';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { useApi, useWidget } from '../../../hooks';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';

// const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
//   '& .noRead': {
//     fontWeight: 'bold',
//   },
// }));

const TaskDetail = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { data, updateWidgets } = useWidget<{
    workflowId: string;
    workflowActivityId: string;
    userId: string;
  }>('Task Detail');
  // const [pageSize, setPageSize] = useState(10);
  // const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });

  const [workflowId, setWorkflowId] = useState<string>('');
  const [workflowActivityId, setWorkflowActivityId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [submitter, setSubmitter] = useState<string>('');
  const [submissionDate, setSubmissionDate] = useState<string>('');

  const [wfName, setWfName] = useState('');
  // const [wfId, setWfId] = useState('');
  const [actName, setActName] = useState('');
  // const [actId, setActId] = useState('');
  const [perName, setPerName] = useState('');
  const [perId, setPerId] = useState('');
  const [toPerId, setToPerId] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [delegateComment, setDelegateComment] = useState('');
  const [terminateComment, setTerminateComment] = useState('');

  const [userList, setUserList] = useState<User[]>([]);

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDelegateDialogOpen, setIsDelegateDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [isSupervior, setIsSupervior] = useState('N');

  const [tableId, setTableId] = useState('');
  const [typeLabel, setTypeLabel] = useState('');
  const [recIdList, setRecIdList] = useState<string[]>([]);

  const typeId = useMemo(() => tableId, [tableId]);

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

  useEffect(() => {
    getUserList();
  }, []);

  useEffect(() => {
    console.log('data===', data);
    if (data?.workflowActivityId) {
      setWorkflowId(data.workflowId);
      setWorkflowActivityId(data.workflowActivityId);
      setUserId(data.userId);
    }
  }, [data?.workflowActivityId]);

  // const { data: taskDetail } = useQuery(['Task Detail', { wfId, sortingOptions, page, pageSize }], async () => {
  //   const { data } = await client.myInbox.getAttachmentsByWfWorkflowId({
  //     id: wfId,
  //     page: {
  //       pageState: { page: page + 1, pageSize },
  //       sortModel: sortingOptions,
  //     }
  //   });
  //   console.log('TaskDetail===', data);
  //   return data;
  // });
  const { data: tableColumn, isLoading } = useQuery(
    ['Task Detail', recIdList],
    async () => {
      const { data: tableResponse } = await client.recordService.getRecordListByRecIds({
        typeId,
        recordIdList: recIdList,
      });
      return tableResponse;
    },
    {
      enabled: !!typeId,
    }
  );

  useQuery(
    ['Task Detail', workflowActivityId],
    async () => {
      return (await client.myInbox.getTaskDetail({ id: workflowActivityId ?? '' })).data;
    },
    {
      enabled: !!workflowActivityId,
      onSuccess: (data) => {
        console.log('Task Detail data ========', data);
        const userId = data.taskDetail.userId;
        setPerId(userId);
        for (let u of userList) {
          u.checked = false;
        }
        for (let u of userList) {
          if (u.id === userId) {
            setPerName(u.name);
            u.checked = true;
          }
        }
        setTableId(data.typeId);
        setTypeLabel(data.typeLabel);
        if (data.recordIdList != null && data.recordIdList != undefined) {
          setRecIdList([...data.recordIdList]);
        } else {
          setRecIdList([]);
        }
        updateWidgets({
          'Record Edit Data': { typeId: data.typeId, recordId: [...data.recordIdList] },
        });
        setWfName(data.taskDetail.wfWorkflowName);
        setActName(data.taskDetail.wfActivityName);
        setSubmitter(data.taskDetail.submitterName);
        setSubmissionDate(data.taskDetail.submissionDate);
        setIsSupervior(data.taskDetail.isSuper);
      },
    }
  );

  const approveTask = useMutation((data: ApproveTaskInput) => client.myInbox.approveTask(data), {
    onSuccess: () => {
      resetParams();
      queryClient.invalidateQueries('myInbox');
      queryClient.invalidateQueries('myOutbox');
      queryClient.invalidateQueries('Task Detail');
    },
  });

  const rejectTask = useMutation((data: RejectTaskInput) => client.myInbox.rejectTask(data), {
    onSuccess: () => {
      resetParams();
      queryClient.invalidateQueries('myInbox');
      queryClient.invalidateQueries('myOutbox');
      queryClient.invalidateQueries('Task Detail');
    },
  });

  const delegateTask = useMutation((data: DelegateTaskInput) => client.myInbox.delegateTask(data), {
    onSuccess: () => {
      resetParams();
      queryClient.invalidateQueries('myInbox');
      queryClient.invalidateQueries('myOutbox');
      queryClient.invalidateQueries('Task Detail');
    },
  });

  const terminateWorkflow = useMutation(
    (data: TerminateWorkflowInput) => client.myInbox.terminateWorkflow(data),
    {
      onSuccess: () => {
        resetParams();
        queryClient.invalidateQueries('myInbox');
        queryClient.invalidateQueries('myOutbox');
        queryClient.invalidateQueries('Task Detail');
      },
    }
  );

  function getFullName(params: any) {
    const userId = params.row.userId;
    return userList.filter((item) => item.id == userId)[0]?.name;
  }

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setUserList(userData.map((item) => ({ ...item, checked: false })));
  };

  const handleApprove = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    if (toPerId == '') {
      approveTask.mutate({
        workflowId: workflowId,
        workflowActivityId: workflowActivityId,
        userId: perId,
        approveDate: aDate,
        comment: approveComment,
      });
    } else {
      delegateTask.mutate({
        workflowId: workflowId,
        workflowActivityId: workflowActivityId,
        fromUserId: perId,
        toUserId: toPerId,
        delegateDate: aDate,
        comment: approveComment,
      });
    }
  };

  const handleReject = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    rejectTask.mutate({
      workflowId: workflowId,
      workflowActivityId: workflowActivityId,
      userId: perId,
      rejectDate: aDate,
      comment: rejectComment,
    });
  };

  const handleDelegate = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    delegateTask.mutate({
      workflowId: workflowId,
      workflowActivityId: workflowActivityId,
      fromUserId: perId,
      toUserId: toPerId,
      delegateDate: aDate,
      comment: delegateComment,
    });
  };

  const handleTerminate = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    terminateWorkflow.mutate({
      workflowId: workflowId,
      userId: perId,
      terminateDate: aDate,
      comment: terminateComment,
    });
  };

  const resetParams = () => {
    setWorkflowId('');
    setWorkflowActivityId('');
    setUserId('');
    setPerId('');
    setWfName('');
    setActName('');
    setSubmitter('');
    setSubmissionDate('');
    setIsSupervior('');
    updateWidgets({
      'Task Comment': { workflowId: '', workflowActivityId: '', userId: '' },
      'Task Detail': { workflowId: '', workflowActivityId: '', userId: '' },
    });
  };
  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {rows.length === 0 && 'No Record'}
    </DataNotFoundOverlay>
  );
  const columns: GridColDef[] = useMemo(
    () =>
      tableColumn?.columnList.map(
        (item) =>
          item && {
            field: item?.misColumnName,
            headerName: item?.misColumnLabel,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
          }
      ) ?? [],
    [tableColumn?.columnList]
  );
  const rows = useMemo(
    () =>
      tableColumn?.recordList.map((item) =>
        item.reduce((prev, nex, index, arr) => ({ ...prev, [columns[index].field]: nex }), {
          id: item[0],
        })
      ) ?? [],
    [columns, tableColumn?.recordList]
  );

  return (
    <>
      {workflowActivityId != '' ? (
        <Paper
          sx={{
            height: '100%',
            backgroundColor: 'white',
            padding: '10px',
            overflowY: 'auto',
            borderRadius: '12px',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5">Workflow：{wfName}</Typography>

            <Typography variant="h5">Submitted by：{submitter}</Typography>

            <Typography variant="h5">
              Submission Date：
              {submissionDate == ''
                ? ''
                : DateTime.fromMillis(submissionDate as unknown as number).toFormat(
                    'yyyy-MM-dd hh:mm:ss'
                  )}
            </Typography>
          </Stack>

          {/* <StyledDataGrid
            autoHeight
            rows={taskDetail?.data ?? []}
            rowCount={taskDetail?.total ?? 0}
            disableColumnMenu
            pagination
            paginationMode="server"
            sortingMode="server"
            onSortModelChange={handleSortModelChange}
            getRowId={(row) => row['key']}
            columns={columns}
            page={page}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          // set row has read style
          // onRowClick={handleRowClick}
          /> */}
          <Stack spacing={2}>
            <Typography variant="h5"></Typography>
          </Stack>
          <FormControl variant="standard" sx={{ marginBottom: 3 }}>
            <InputLabel id="demo-simple-select-label">Table</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              disabled={true}
              value={typeId}
              displayEmpty
              renderValue={(value) => {
                return typeLabel;
              }}
              label="typeLabel"
              onChange={(evt) => {}}
            >
              <MenuItem key={typeId} value={typeId}>
                {typeLabel}
              </MenuItem>
            </Select>
          </FormControl>
          <DataGrid
            components={{
              NoRowsOverlay: DataNotFound,
            }}
            autoHeight
            loading={isLoading}
            columns={columns}
            rows={rows}
            onRowClick={(param) => {}}
          />
          <Stack direction="row" spacing={2} mb={3} mt={3}>
            <Button
              disableElevation
              variant="contained"
              onClick={() => {
                if (workflowActivityId !== '') {
                  setIsApproveDialogOpen(true);
                }
              }}
            >
              Approve
            </Button>
            <Button
              disableElevation
              variant="contained"
              onClick={() => {
                if (workflowActivityId !== '') {
                  setIsRejectDialogOpen(true);
                }
              }}
            >
              Reject
            </Button>
            <Button
              disableElevation
              variant="contained"
              onClick={() => {
                if (workflowActivityId !== '') {
                  setIsDelegateDialogOpen(true);
                }
              }}
            >
              Delegate
            </Button>
            {isSupervior === 'Y' && (
              <Button
                sx={{ float: 'left' }}
                variant="contained"
                onClick={() => {
                  if (workflowActivityId !== '') {
                    setIsTerminateDialogOpen(true);
                  }
                }}
              >
                Terminate
              </Button>
            )}
          </Stack>
        </Paper>
      ) : (
        <Paper
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ mt: 1 }}>Please Select a Record</Box>
        </Paper>
      )}

      <Dialog open={isApproveDialogOpen}>
        <DialogTitle>Approve Task</DialogTitle>
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
          <FormControl variant="standard" sx={{ width: 200 }}>
            <InputLabel id="demo-simple-select-standard-label">To User</InputLabel>
            <Select
              displayEmpty
              labelId="toUserId"
              id="toUserId"
              onChange={(evt) => setToPerId(evt.target.value as string)}
            >
              {userList?.map((item) => {
                return (
                  <MenuItem key={item.id} value={item.id} disabled={item.checked}>
                    {item.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={6} mb={3} mt={3}></Stack>

          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <TextField
              id="approveComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={4}
              defaultValue=""
              onChange={(evt) => setApproveComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleApprove();
              setIsApproveDialogOpen(false);
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              setIsApproveDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isRejectDialogOpen}>
        <DialogTitle>Reject Task</DialogTitle>
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
              id="rejectComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={4}
              defaultValue=""
              onChange={(evt) => setRejectComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleReject();
              setIsRejectDialogOpen(false);
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              setIsRejectDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDelegateDialogOpen}>
        <DialogTitle>Delegate Task</DialogTitle>
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
          <br />
          <FormControl variant="standard" sx={{ width: 200 }}>
            <InputLabel id="demo-simple-select-standard-label">To User</InputLabel>
            <Select
              displayEmpty
              labelId="toUserId"
              id="toUserId"
              onChange={(evt) => setToPerId(evt.target.value as string)}
            >
              {userList?.map((item) => {
                return (
                  <MenuItem key={item.id} value={item.id} disabled={item.checked}>
                    {item.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={6} mb={3} mt={3}></Stack>

          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <TextField
              id="delegateComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={4}
              defaultValue=""
              onChange={(evt) => setDelegateComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleDelegate();
              setIsDelegateDialogOpen(false);
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              setIsDelegateDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isTerminateDialogOpen}>
        <DialogTitle>Terminate Task</DialogTitle>
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
              id="terminateComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={4}
              defaultValue=""
              onChange={(evt) => setTerminateComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleTerminate();
              setIsTerminateDialogOpen(false);
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              setIsTerminateDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskDetail;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
