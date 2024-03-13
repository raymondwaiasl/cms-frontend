import { QueryRenditionDataInput } from '../../../api';
import { useApi, useDialog, useWidget } from '../../../hooks';
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  Button,
  Box,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';

const RenditionWidget = () => {
  const queryClient = useQueryClient();
  const [renditionDetail, setRenditionDetail] = useState<any[]>([]);
  // const [folderPermission, setFolderPermission] = useState<'1' | '2'>();
  // const { getRenditionByRecordId } = useApi();
  const client = useApi();
  const { openDialog, updateDialog, closeDialog } = useDialog();
  const { data } = useWidget<{ recordId: string }>('Rendition');

  const DeleteRendition = useMutation(client.renditionService.deleteRenditionByRenditionId, {
    onSuccess: () => {
      queryClient.invalidateQueries('Rendition');
      closeDialog('deleteDialog');
    },
  });

  const { data: detailData } = useQuery(
    ['Rendition', data?.recordId ?? ''],
    async () => {
      const { data: response } = await client.renditionService.getRenditionByRecordId({
        id: data?.recordId ?? '',
      });
      return response;
    },
    {
      onSuccess: (data) => {
        setRenditionDetail([...data]);
        // setFolderPermission(data.)
      },
      enabled: typeof data?.recordId === 'string',
    }
  );

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
      <TableContainer component={Paper}>
        <Button
          variant="outlined"
          sx={{ float: 'right' }}
          onClick={() => {
            console.log('calling', detailData);
            console.log('calling   recordId==========', data?.recordId);

            openDialog('renditionDialog', {
              title: 'New Rendition',
              deleteBtnTitle: 'Upload',
              data: {
                misTypeId: renditionDetail[0]?.misTypeId,
                misRecordId: renditionDetail[0]?.misRecordId,
              },
              onConfirmAction: (newData: QueryRenditionDataInput) => {
                console.log(newData);
              },
            });
          }}
        >
          New
        </Button>

        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Primary</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Created by</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renditionDetail.map((row, index) => (
              <TableRow
                key={row.cmsRenditionId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.format.cmsFormat}</TableCell>
                <TableCell>{row.cmsIsPrimary}</TableCell>
                <TableCell>
                  {DateTime.fromMillis(row.cmsRenditionDate).toFormat('dd/MM/yyyy hh:mm')}
                </TableCell>
                <TableCell>{row.user.misUserName}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => {
                      openDialog('deleteDialog', {
                        title: 'Delete Rendition',
                        message: 'Are you sure to delete this rendition',
                        isDataReq: true,
                        confirmAction: () => {
                          DeleteRendition.mutate({ id: row.cmsRenditionId });
                          updateDialog('deleteDialog', { isLoading: DeleteRendition.isLoading });
                        },
                      });
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RenditionWidget;
