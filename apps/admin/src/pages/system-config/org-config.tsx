import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const OrgConfig = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { openDialog } = useDialog();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const orgColumns: GridColDef[] = [
    {
      field: 'misOrganizationId',
      headerName: 'Organization ID',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'misOrganizationName',
      headerName: 'Organization Name',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'Action',
      type: 'actions',
      headerAlign: 'left',
      headerName: 'Action',
      minWidth: 200,
      flex: 1,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Organizaiton',
                  message: `Are you sure to delete ${props.row.misOrganizationName}`,
                  confirmAction: () => delOrgNameOnPage.mutate({ orgId: props.id as string }),
                });
              }}
            >
              DELETE
            </Button>
          </>
        );
      },
    },
  ];

  const { data: orgItems, isLoading } = useQuery(
    'orgConfig',
    async () => {
      const { data: response } = await client.organization.getSysConfigOrgItems();
      return response;
    },
    {
      placeholderData: [],
    }
  );

  const saveOrgNameOnPage = useMutation(client.organization.saveOrgName, {
    onSuccess: () => {
      queryClient.invalidateQueries('orgConfig');
    },
    onSettled: () => {
      setIsCreateDialogOpen(false);
    },
  });

  const delOrgNameOnPage = useMutation(client.organization.deleteOrgById, {
    onSuccess: () => {
      queryClient.invalidateQueries('orgConfig');
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ orgName: string }>({ mode: 'onSubmit' });

  return (
    <>
      <Card sx={{ minWidth: 275, maxWidth: 700 }}>
        <CardContent>
          <Typography variant="h5">Organization</Typography>
          <Button variant="contained" sx={{ my: 1 }} onClick={() => setIsCreateDialogOpen(true)}>
            Create New
          </Button>
          <DataGrid
            loading={isLoading}
            autoHeight
            rows={orgItems}
            rowsPerPageOptions={[10, 30, 50, 70, 100]}
            pagination={true}
            columns={orgColumns}
            disableColumnMenu
            getRowId={(row) => row.misOrganizationId}
          />
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen}>
        <form
          onSubmit={handleSubmit((data) => {
            saveOrgNameOnPage.mutate({ orgName: data.orgName });
          })}
        >
          <DialogTitle>Create Organization</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >
            <Controller
              name="orgName"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.orgName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Org Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.orgName?.message as string}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              Create
            </Button>
            <Button
              onClick={() => {
                setIsCreateDialogOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default OrgConfig;
