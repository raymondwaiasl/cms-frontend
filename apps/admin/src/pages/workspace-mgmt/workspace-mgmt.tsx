import {
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  Radio,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { FindParentCandidateByIdData } from 'libs/common/src/lib/api/workspaceService';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useCallback, useState } from 'react';
import { AiOutlineDelete, AiOutlineNodeIndex } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const WorkspaceMgmt = () => {
  const [parentCandidate, setParentCandidate] = useState<Array<FindParentCandidateByIdData>>([]);

  const history = useHistory();
  const queryClient = useQueryClient();
  const client = useApi();
  const { openDialog } = useDialog();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });
  const [openParentDialog, setOpenParentDialog] = useState(false);
  const [parentHelperText, setParentHelperText] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [parentId, setParentId] = useState('');

  const handleSortModelChange = useCallback((sortModel: any) => {
    // Here you save the data you need from the sort model
    const [options] = sortModel;
    console.log(options);
    setSortingOptions(
      options ?? {
        field: '',
        sort: '',
      }
    );
  }, []);
  const {
    data: workspace,
    isLoading,
    isRefetching,
  } = useQuery(['workspace', page, pageSize, sortingOptions], async () => {
    const { data } = await client.workspace.getWorkspaceListPageable({
      pageState: { page: page + 1, pageSize },
      sortModel: sortingOptions,
    });
    return data;
  });

  const deleteWorkspace = useMutation(client.workspace.deleteWorkspaceById, {
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace', page, pageSize, sortingOptions]);
      toast('Delete Success', {
        type: 'success',
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'misWorkspaceId', headerName: 'S/N', width: 150, flex: 1 },
    {
      field: 'misWorkspaceName',
      headerName: 'Workspace Name',
      width: 150,
      type: 'text',
      flex: 1,
    },
    {
      field: 'misParentWorkspaceName',
      headerName: 'Parent Workspace Name',
      width: 150,
      type: 'text',
      flex: 1,
      sortable: false,
    },
    {
      field: 'misSortNum',
      headerName: 'Sort Number',
      flex: 1,
    },
    {
      field: 'Action',
      headerName: 'Action',
      minWidth: 200,
      type: 'actions',
      headerAlign: 'left',
      flex: 1,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() =>
                history.push({
                  pathname: route.workspaceDetail,
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
                  title: 'Delete Workspace',
                  message: `Are you sure to delete ${props.row.misWorkspaceName}`,
                  confirmAction: () => deleteWorkspace.mutate({ id: props.id as string }),
                });
              }}
            >
              DELETE
            </Button>
            <Button
              startIcon={<AiOutlineNodeIndex />}
              variant="outlined"
              size="small"
              // 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
              color="warning"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                client.workspace
                  .findParentCandidateById(props.row.misWorkspaceId)
                  .then((result) => {
                    setParentCandidate(result.data);
                    setOpenParentDialog(true);
                    setParentId('');
                    setParentHelperText('');
                    setCurrentId(props.row.misWorkspaceId);
                  })
                  .catch((error) => {
                    toast('query fail', {
                      type: 'error',
                    });
                  });
              }}
            >
              SET PARENT
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Typography variant="h5">Workspace Management</Typography>
      <Button
        variant="contained"
        sx={{ marginY: 1 }}
        onClick={() => history.push(route.workspaceDetail)}
      >
        Create New
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
          rows={workspace?.data ?? []}
          loading={isLoading || isRefetching}
          rowCount={workspace?.total}
          disableColumnMenu
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          experimentalFeatures={{ newEditingApi: true }}
          getRowId={(row) => row.misWorkspaceId}
          columns={columns}
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </Paper>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={openParentDialog}
      >
        <DialogTitle>Select Parent Workspace</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            onChange={(e) => {
              setParentId((e.target as HTMLInputElement).value);
              setParentHelperText('');
            }}
          >
            {parentCandidate.map((c) => (
              <FormControlLabel value={c.id} key={c.id} control={<Radio />} label={c.name} />
            ))}
          </RadioGroup>
        </DialogContent>
        <FormHelperText error={true}>{parentHelperText}</FormHelperText>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => {
              setOpenParentDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={(value) => {
              if (!parentId) {
                setParentHelperText('Please select an option');
                return;
              }

              client.workspace
                .setParent({ id: currentId, parent: parentId })
                .then((result) => {
                  setCurrentId('');
                  setParentId('');
                  setParentHelperText('');
                  toast('operate success', {
                    type: 'success',
                  });
                  queryClient.invalidateQueries(['workspace', page, pageSize, sortingOptions]);
                  setOpenParentDialog(false);
                })
                .catch((error) => {
                  toast('operate fail', {
                    type: 'error',
                  });
                });
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkspaceMgmt;
