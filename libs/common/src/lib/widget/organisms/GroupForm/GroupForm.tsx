import { useApi, useDialog, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import styles from './GroupForm.module.scss';
import UserView from './UserView';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import { AiOutlineDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const level: { [key: string]: 'ORGANIZATION' | 'ROLE' | 'GROUP' | 'USER' } = {
  root: 'ORGANIZATION',
  '2': 'ROLE',
  '3': 'GROUP',
  '4': 'USER',
};

const OrgColumn = [
  { field: 'name', headerName: 'Role Name' },
  { field: 'action', type: 'actions', headerAlign: 'left', headerName: 'Action' },
];
const groupColumn = [
  { field: 'name', headerName: 'Role Name' },
  { field: 'type', headerName: 'org Type' },
  { field: 'action', type: 'actions', headerAlign: 'left', headerName: 'Action' },
];

const otherConfig = {
  pageState: {
    page: 1,
    pageSize: 10,
  },
  sortModel: {
    field: '',
    sort: '',
  },
};

const GroupForm = () => {
  const client = useApi();
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const { data: input } = useWidget<{
    nodeId: string;
    level: 'root' | '2' | '3' | '4';
  }>('Member');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const ButtonOnClickHandling = () => {
    openDialog('roleMgmt', {
      isOrgnanization: roleType === 'ORGANIZATION',
      name: '',
      isAdministrator: false,
      ...inputVariable,
    });
  };
  const inputVariable = useMemo(
    () => (input?.level && input.nodeId ? input : { level: 'root', nodeId: 'root' }),
    [input]
  );
  const roleType = useMemo(() => (input?.level ? level[input?.level] : 'ORGANIZATION'), [input]);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };
  const DeleteGroupUser = useMutation(client.userService.delGroupUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
    },
  });
  const DeleteRole = useMutation(client.userService.delRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
    },
  });

  const { data: groupData } = useQuery(['Member', inputVariable, otherConfig], async () => {
    const { data: memberData } = await client.userService.getMember({
      ...(inputVariable as {
        nodeId: string;
        level: 'root' | '2' | '3' | '4';
      }),
      ...otherConfig,
    });
    console.log('memberData.data===', memberData.data);
    return memberData.data;
  });
  const { data: userData } = useQuery(
    ['groupUser', inputVariable],
    async () => {
      const { data: memberData } = await client.userService.getUserInfo(
        inputVariable as {
          nodeId: string;
          level: 'root' | '2' | '3' | '4';
        }
      );
      return memberData[0];
    },
    { enabled: roleType === 'USER' }
  );

  return (
    <Paper
      sx={{
        minHeight: '100%',
        padding: 2,
        marginTop: 2,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      {roleType === 'USER' ? (
        <UserView
          loginId={userData?.misUserId}
          username={userData?.misUserName}
          location={userData?.misUserLocation}
          email={userData?.misEmail}
        />
      ) : (
        <>
          <Button
            {...btnStyle.primary}
            style={{ textTransform: 'none' }}
            startIcon={<AiOutlineUsergroupAdd />}
            className={styles.mainButton}
            onClick={ButtonOnClickHandling}
            disabled={!input?.nodeId}
          >
            Create New
          </Button>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" stickyHeader>
              <TableHead>
                <TableRow>
                  {roleType === 'ORGANIZATION'
                    ? OrgColumn.map((item) => (
                        <TableCell size="small" key={item.field}>
                          {item.headerName}
                        </TableCell>
                      ))
                    : groupColumn.map((item) => (
                        <TableCell size="small" key={item.field}>
                          {item.headerName}
                        </TableCell>
                      ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {groupData &&
                  !!groupData.length &&
                  groupData.map((row) => (
                    <TableRow key={row.id ?? row.misRoleId}>
                      <TableCell align="left">{row.name ?? row.misRoleName}</TableCell>
                      {(row.type === 'group' || row.type === 'user') && (
                        <TableCell align="left">{row.type}</TableCell>
                      )}
                      <TableCell align="left">
                        {(!row.type || (row.type && row.type !== 'user')) && (
                          <>
                            <Button
                              variant="outlined"
                              style={{ textTransform: 'none' }}
                              size="small"
                              startIcon={<FiEdit2 />}
                              onClick={() =>
                                openDialog('roleMgmt', {
                                  id: row.id ?? row.misRoleId,
                                  isOrgnanization: roleType === 'ORGANIZATION',
                                  name: row.name ?? row.misRoleName,
                                  isAdministrator: row.isAdmin ?? 'N',
                                  defaultFolderId: row.defaultFolderId ?? '',
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              startIcon={<AiOutlineDelete />}
                              variant="outlined"
                              style={{ textTransform: 'none' }}
                              size="small"
                              color="error"
                              sx={{ marginLeft: (theme) => theme.spacing(1) }}
                              onClick={() => {
                                openDialog('deleteDialog', {
                                  title: `Delete ${row?.type ?? 'Role'}`,
                                  message: `Are you sure to delete ${row.name ?? row.misRoleName}`,
                                  confirmAction:
                                    roleType === 'ORGANIZATION'
                                      ? () =>
                                          DeleteRole.mutate({
                                            misRoleId: row.id ?? (row.misRoleId as string),
                                          })
                                      : () =>
                                          DeleteGroupUser.mutate({
                                            id: row.id ?? (row?.misRoleId as string),
                                            nodeId: inputVariable.nodeId as string,
                                            type: '3',
                                          }),
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={groupData?.length ?? 0}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default GroupForm;
