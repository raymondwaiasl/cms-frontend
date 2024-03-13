/* eslint-disable jsx-a11y/anchor-is-valid */
import { Typography, Button, Link } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDialog, useApi } from 'libs/common/src/lib/hooks';
import { useState, useCallback } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const StoragePage = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const columns: GridColDef[] = [
    {
      field: 'cmsStorageId',
      headerName: 'S/N',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStorageName',
      headerName: 'Storage\u00a0Name',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStoragePath',
      headerName: 'Location',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStorageSpace',
      headerName: 'Total',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStorageUsed',
      headerName: 'Used',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStorageFree',
      headerName: 'Free',
      minWidth: 180,
      flex: 1,
    },
    {
      field: 'cmsStorageThreshold',
      headerName: 'Threshold',
      minWidth: 180,
      valueGetter: getFullName,
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      minWidth: 250,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() => {
                handleEdit(params.row.cmsStorageId);
              }}
              color="primary"
            >
              Edit
            </Button>{' '}
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Storage',
                  message: `Are you sure to delete ${params.row.cmsStorageName}`,
                  confirmAction: () => DeleteStorage.mutate({ id: params.row.cmsStorageId }),
                });
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
  const history = useHistory();
  const client = useApi();

  const thresholds: any[] = [
    { key: 0.1, value: '10%' },
    { key: 0.2, value: '20%' },
    { key: 0.3, value: '30%' },
    { key: 0.4, value: '40%' },
    { key: 0.5, value: '50%' },
    { key: 0.6, value: '60%' },
  ];

  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const createNew = () => {
    history.push('/storage/detail');
  };

  const handleEdit = (misContextId: string) => {
    history.push(`/storage/detail?id=${misContextId}`);
  };

  const DeleteStorage = useMutation(client.storage.deleteStorageById, {
    onSuccess: () => {
      queryClient.invalidateQueries('storage');
    },
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

  const {
    data: storagetData,
    isLoading,
    isRefetching,
  } = useQuery(['storage', page, pageSize, sortingOptions], async () => {
    const { data: response } = await client.storage.getStorageListPageable({
      pageState: { page: page + 1, pageSize },
      sortModel: sortingOptions,
    });
    return response;
  });

  function getFullName(params: any) {
    if (thresholds) {
      return thresholds?.find((item) => item.key === params.row.cmsStorageThreshold)?.value ?? '';
    }
    return params.row.cmsStorageThreshold;
  }

  console.log(storagetData);

  return (
    <div>
      <Typography variant="h5">Storage Management</Typography>
      <Button variant="contained" sx={{ my: 1 }} onClick={createNew}>
        Create Storage
      </Button>

      <DataGrid
        autoHeight
        rows={storagetData?.data ?? []}
        rowCount={storagetData?.total}
        loading={isLoading || isRefetching}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        columns={columns}
        disableColumnMenu
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        getRowId={(row) => row.cmsStorageId}
      />
    </div>
  );
};

export default StoragePage;

export interface pageDataIntf {
  misContextId: string;
  misContextName: string;
  misRoleName: string;
}
