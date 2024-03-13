import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { useApi, useWidget } from '../../../hooks';
import dataStore from '../../../store/dataStore';
import { Box, Button, Paper, Stack, styled, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useRecoilValue } from 'recoil';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .noRead': {
    fontWeight: 'bold',
  },
}));

const RecordEditHistory = () => {
  const queryClient = useQueryClient();
  const store = useRecoilValue(dataStore);
  const client = useApi();
  const { data, updateWidgets } = useWidget<{
    typeId: string;
    recordId: string[];
  }>('Record Edit Data');

  const [userId, setUserId] = useState<string>('');
  const [tableId, setTableId] = useState('');
  const [recIdList, setRecIdList] = useState<string[]>([]);
  const typeId = useMemo(() => tableId, [tableId]);
  const [recordId, setRecordId] = useState('');

  const { data: tableColumn, isLoading } = useQuery(
    ['Record History', recordId],
    async () => {
      const { data: tableResponse } = await client.recordService.getRecordEditHistoryByRecId({
        typeId,
        recordId: recordId,
      });
      console.log('tableResponse========', tableResponse);
      return tableResponse;
    },
    {
      enabled: !!typeId,
    }
  );

  useEffect(() => {
    if (data?.typeId) {
      let recordLocalId = data.recordId[0];
      setTableId(data.typeId);
      setRecordId(recordLocalId);
    }
  }, [data?.typeId]);

  useEffect(() => {
    if (data?.typeId) {
      let reId = data.recordId[0];
      setTableId(data.typeId);
      setRecordId(reId);
    }
  }, [data?.typeId]);

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
            minWidth: 150,
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
          rows={rows}
        />
      </Paper>
    </>
  );
};

export default RecordEditHistory;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
