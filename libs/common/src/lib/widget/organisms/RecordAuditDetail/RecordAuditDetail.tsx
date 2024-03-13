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
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useRecoilValue } from 'recoil';

const RecordAuditDetail = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { data, updateWidgets } = useWidget<{
    typeId: string;
    recordId: string;
  }>('Record Audit Detail');

  const [userList, setUserList] = useState<User[]>([]);

  useEffect(() => {
    getUserList();
  }, []);

  const { data: tableColumn, isLoading } = useQuery(
    ['Record Audit Detail', data?.recordId],
    async () => {
      const { data: tableResponse } = await client.recordService.getRecordAuditDetailByRecId({
        typeId: data?.typeId as string,
        recordId: data?.recordId as string,
      });
      console.log('tableResponse========', tableResponse);
      return tableResponse;
    },
    {
      enabled: !!data?.typeId,
    }
  );

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {tableColumn?.recordList.length === 0 && 'No Record'}
    </DataNotFoundOverlay>
  );
  const columns: GridColDef[] = [
    {
      field: 'misOperationTime',
      headerName: 'Timestamp',
      minWidth: 150,
      valueFormatter: ({ value }) =>
        value != null ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd hh:mm') : '',
    },
    {
      field: 'misAuditDtlAction',
      headerName: 'Action',
      minWidth: 150,
    },
    {
      field: 'misOperator',
      headerName: 'User',
      minWidth: 150,
      valueGetter: getFullName,
    },
  ];

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setUserList(userData.map((item) => ({ ...item, checked: false })));
  };
  function getFullName(params: any) {
    const userId = params.row.misOperator;
    return userList.filter((item) => item.id == userId)[0]?.name;
  }

  return (
    <>
      {data?.typeId != '' ? (
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
            <Typography variant="h5"></Typography>
          </Stack>

          <DataGrid
            components={{
              NoRowsOverlay: DataNotFound,
            }}
            autoHeight
            loading={isLoading}
            columns={columns}
            rows={tableColumn?.recordList ?? []}
            getRowId={(row) => row['misAuditDtlId']}
            // checkboxSelection
            // onSelectionModelChange={(item) => {
            //   console.log('item===', item.length);
            //   console.log('item===', item[0]);
            //   setLen(item.length);
            //   setId1(item[0] as string);
            //   setId2(item[1] as string);
            // }}
            onRowClick={(param) => {
              console.log('onRowClickonRowClickonRowClickonRowClicks');
              updateWidgets({
                'Record Comparison': {
                  typeId: data?.typeId,
                  id1: param.row.misAuditRechistBfid,
                  id2: param.row.misAuditRechistAfid,
                },
              });
            }}
          />
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
    </>
  );
};

export default RecordAuditDetail;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
