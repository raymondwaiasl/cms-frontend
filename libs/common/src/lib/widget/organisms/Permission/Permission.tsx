import { SavePermissionDataInput } from '../../../api';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { useApi, useDialog, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import { Box, Button } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import { filePermission, levelIcon } from 'libs/common/src/lib/constant';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const PermissionWidget = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { openDialog } = useDialog();
  const { data } = useWidget<{ id: string; isFolder: boolean; typeId: string; recordId: string }>(
    'Permission'
  );
  const { data: groupData } = useQuery(
    'group',
    async () => {
      const { data } = await client.userService.queryGroupData({ id: '3' });
      return data;
    },
    {
      initialData: queryClient.getQueryData('group'),
    }
  );
  const { data: userData } = useQuery(
    'user',
    async () => {
      const { data } = await client.userService.queryGroupData({ id: '4' });
      return data;
    },
    {
      initialData: queryClient.getQueryData('user'),
    }
  );
  const { data: detailData, isLoading } = useQuery(
    [
      'Permission',
      {
        id: data?.id,
        isFolder: data?.isFolder,
        typeId: data?.typeId,
        recordId: data?.recordId,
      },
    ],
    async () => {
      if (!data?.isFolder) {
        const { data: response } = await client.userPermission.queryRecordPermission({
          typeId: data?.typeId ?? '',
          recordId: data?.recordId ?? '',
        });
        return response;
      }
      const { data: response } = await client.userPermission.queryFolderPermission({
        id: data?.id ?? '',
      });
      return response;
    },
    {
      // onSuccess: (data) => {
      //   // setPermissionDetail(data.details);
      //   // setFolderPermission(data.)
      // },
      enabled: typeof data?.id === 'string',
    }
  );
  const modifyPermissionDetail = useMutation(
    (data: SavePermissionDataInput) => client.userPermission.savePermissionData(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('Permission');
      },
    }
  );
  const delPermission = useMutation(client.userPermission.deletePermissionData, {
    onSuccess: () => {
      queryClient.invalidateQueries('permission');
    },
  });
  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiOutlineFolderOpen size={40} />}>
      {!data?.id && 'Please Select a folder'}
    </DataNotFoundOverlay>
  );

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ float: 'right', paddingX: 1, marginBottom: 3 }}>
      <Button
        {...btnStyle.primary}
        style={{ textTransform: 'none' }}
        disabled={!data?.id}
        onClick={() => {
          openDialog('permissionDialog', {
            title: 'Edit Permission',
            data: detailData,
            groupList: groupData,
            userList: userData,
            onConfirmAction: (newData: Omit<SavePermissionDataInput, 'folderId'>) => {
              console.log(newData);
              modifyPermissionDetail.mutate({
                folderId: data?.id ?? '',
                folderPer: newData.folderPer,
                permission: newData.permission,
              });
            },
          });
        }}
      >
        Edit Permission
      </Button>
    </GridToolbarContainer>
  );
  return (
    <DataGrid
      autoHeight
      sx={{
        backgroundColor: 'white',
        border: 'none',
        ['.MuiDataGrid-columnHeaders']: {
          backgroundColor: '#EDEDEB',
        },
        ['.MuiButtonBase-root.Mui-checked']: {
          color: '#8C8C8C',
        },
        ['.MuiDataGrid-cell']: {
          border: 'none',
        },
        ['.MuiDataGrid-row.Mui-selected']: {
          backgroundColor: '#eaeaea',
          [':hover']: {
            backgroundColor: '#eaeaea',
          },
        },
      }}
      loading={isLoading}
      getRowId={(row) => row?.misPdId}
      components={{
        Toolbar: CustomToolbar,
        NoRowsOverlay: DataNotFound,
      }}
      columns={[
        {
          field: 'misPdType',
          headerName: 'Type',
          flex: 1,
          renderCell: (params) => (
            <>
              <Box component={levelIcon[params.value]} color="inherit" sx={{ mr: 1 }} />
              {params.value === '3' ? 'Group' : 'User'}
            </>
          ),
        },
        {
          field: 'misPdPerformerId',
          flex: 1,
          headerName: 'Name',
          valueGetter: (param) =>
            param.row.misPdType === '3'
              ? groupData?.find((item) => item.id === param.value)?.name
              : userData?.find((item) => item.id === param.value)?.name,
        },
        {
          flex: 1,
          field: 'misPdRight',
          headerName: 'Permission',
          valueFormatter: (param) => filePermission[param.value as '3' | '5' | '7' | '0'],
        },
      ]}
      rows={detailData?.details ?? []}
    />
  );
};

export default PermissionWidget;
