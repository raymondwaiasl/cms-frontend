import { SaveSubscriptionInput } from '../../api';
import { SaveColumnConfigInput } from '../../api/propertyColumnConfig';
import { ColumnConfigConditionArr } from '../../constant';
import { useApi, useDialog } from '../../hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { TabPanel, TabContext } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FC } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import * as yup from 'yup';

const tabs = ['Validation', 'RegExp', 'Visibility Setting'];
const PropertyColumnConfigDialog: FC<PropertyColumnConfigDialogProps> = ({
  isOpen,
  onCloseAction,
}) => {
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    onConfirmAction: (data: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => void;
  }>('propertyColumnConfigDialog');
  const queryClient = useQueryClient();
  const client = useApi();
  const [activeTab, setActiveTab] = useState('Validation');
  const schema = yup.object().shape({
    qfConditions: yup
      .array()
      .of(
        yup.object().shape({
          misQfc2ColumnId: yup.string().required('This Field is required'),
          misQfc2Condition: yup.string().required('This Field is required'),
          misQfc2Value: yup.string().required('This Field is required'),
        })
      )
      .test('test-0', 'test-msg', (valueArr: any, context: any) => {
        const errors = [];
        for (let i = 0; i < valueArr?.length; i++) {
          if (i > 0 && valueArr[i].misRelation === '') {
            errors.push(
              new yup.ValidationError(
                'This Field is required',
                valueArr[i],
                `qfConditions.${i}.misRelation`
              )
            );
          }
        }
        if (errors.length === 0) {
          return true;
        }
        return new yup.ValidationError(errors);
      }),
  });
  ``;
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

  const {
    handleSubmit,
    reset,
    formState,
    getValues,
    control,
    watch,
    setValue,
    trigger,
    ...others
  } = useForm<Omit<SaveColumnConfigInput, 'misQfGroupId' | 'misQfPublic'> & { regexp: string }>({
    resolver: yupResolver(schema),
    defaultValues: {
      qfConditions: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    name: 'qfConditions',
    control,
  });

  console.log(data);

  return (
    <Dialog
      open={isOpen || isDialogOpen}
      PaperProps={{
        sx: {
          padding: '40px',
          borderRadius: '20px',
          minWidth: '680px',
          maxWidth: '800px',
          overflowX: 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
          Property Column Config
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minWidth: '400px' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          {tabs.map((item, index) => (
            <Tab value={item} label={item} key={`tab-${index}`} />
          ))}
        </Tabs>

        <TabContext value={activeTab}>
          <TabPanel value="Invisible Setting"></TabPanel>
          <TabPanel value={'Validation'}>
            <div
              style={{
                borderTop: '1px solid #eaeaea',
                paddingTop: '16px',
                marginBottom: '16px',
              }}
            >
              {fields.map((field, index) => {
                return (
                  <Stack
                    key={field.id}
                    direction="row"
                    mb={3}
                    flexWrap="wrap"
                    justifyContent={'start'}
                    alignItems={'center'}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      padding: '20px',
                      borderRadius: '20px',
                      backgroundColor: index % 2 !== 0 ? '#F3F6F5' : undefined,
                    }}
                  >
                    {index !== 0 && (
                      <Controller
                        name={`qfConditions.${index}.misRelation`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!formState.errors.qfConditions?.[index]?.misRelation}
                            sx={{ m: 1, width: '100%' }}
                          >
                            <RadioGroup
                              row
                              aria-labelledby="demo-row-radio-buttons-group-label"
                              name="row-radio-buttons-group"
                              value={value}
                              onChange={onChange}
                            >
                              <FormControlLabel value="and" control={<Radio />} label="And" />
                              <FormControlLabel value="or" control={<Radio />} label="Or" />
                            </RadioGroup>
                            <FormHelperText>
                              {
                                formState.errors?.qfConditions?.[index]?.misRelation
                                  ?.message as string
                              }
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    )}

                    <Controller
                      name={`qfConditions.${index}.misQfc2ColumnId`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          //focused={!!paramId}
                          variant="standard"
                          sx={{
                            marginBottom: {
                              xs: 1, // theme.breakpoints.up('xs')
                              sm: 1, // theme.breakpoints.up('sm')
                              md: 0, // theme.breakpoints.up('md')
                              lg: 0, // theme.breakpoints.up('lg')
                              xl: 0, // theme.breakpoints.up('xl')
                            },
                            marginRight: {
                              xs: 0, // theme.breakpoints.up('xs')
                              sm: 0, // theme.breakpoints.up('sm')
                              md: 2, // theme.breakpoints.up('md')
                              lg: 2, // theme.breakpoints.up('lg')
                              xl: 2, // theme.breakpoints.up('xl')
                            },
                            minWidth: 200,
                          }}
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2ColumnId}
                        >
                          <InputLabel id="demo-simple-select-standard-label">
                            Column Name
                          </InputLabel>
                          {/* <Select
                            autoWidth
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            renderValue={(newVal) =>
                              columnList?.find((item) => item.key === newVal)?.value ??
                              columnList?.find(
                                (item) => item.key === `qfConditions.${index}.misQfc2ColumnId`
                              )?.value
                            }
                            value={value}
                            onChange={onChange}
                          >
                            {columnList?.map((item) => {
                              return (
                                <MenuItem key={item.key} value={item.key}>
                                  {item.value}
                                </MenuItem>
                              );
                            })}
                          </Select> */}
                          <Select defaultValue="" id="grouped-select" label="Grouping">
                            <MenuItem value="Group">
                              <em>Group</em>
                            </MenuItem>
                            <MenuItem value="User">
                              <em>User</em>
                            </MenuItem>
                            <ListSubheader>Column Name</ListSubheader>
                            <MenuItem value={1}>Option 1</MenuItem>
                            <MenuItem value={2}>Option 2</MenuItem>
                          </Select>
                          <FormHelperText>
                            {
                              formState.errors?.qfConditions?.[index]?.misQfc2ColumnId
                                ?.message as string
                            }
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name={`qfConditions.${index}.misQfc2Condition`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          //focused={!!paramId}
                          variant="standard"
                          sx={{
                            marginBottom: {
                              xs: 1, // theme.breakpoints.up('xs')
                              sm: 1, // theme.breakpoints.up('sm')
                              md: 0, // theme.breakpoints.up('md')
                              lg: 0, // theme.breakpoints.up('lg')
                              xl: 0, // theme.breakpoints.up('xl')
                            },
                            marginRight: {
                              xs: 0, // theme.breakpoints.up('xs')
                              sm: 0, // theme.breakpoints.up('sm')
                              md: 2, // theme.breakpoints.up('md')
                              lg: 2, // theme.breakpoints.up('lg')
                              xl: 2, // theme.breakpoints.up('xl')
                            },
                            minWidth: 200,
                          }}
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2Condition}
                        >
                          <InputLabel id="demo-simple-select-standard-label">Condition</InputLabel>
                          <Select
                            autoWidth
                            displayEmpty
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            renderValue={(newVal) =>
                              ColumnConfigConditionArr?.find((item) => item.key === newVal)?.value
                            }
                            value={value}
                            onChange={onChange}
                          >
                            {ColumnConfigConditionArr?.map((item) => {
                              return (
                                <MenuItem key={item.key} value={item.key}>
                                  {item.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <FormHelperText>
                            {
                              formState.errors?.qfConditions?.[index]?.misQfc2ColumnId
                                ?.message as string
                            }
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name={`qfConditions.${index}.misQfc2Value`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          //focused={!!paramId}
                          sx={{
                            minWidth: 200,
                            marginBottom: {
                              xs: 2,
                              sm: 2,
                              md: 0,
                              lg: 0,
                              xl: 0,
                            },
                          }}
                          id="standard-basic"
                          variant="standard"
                          error={!!formState.errors.qfConditions?.[index]?.misQfc2Value}
                          onChange={onChange}
                          value={value}
                          label="Value"
                          helperText={
                            formState.errors?.qfConditions?.[index]?.misQfc2Value?.message as string
                          }
                        />
                      )}
                    />

                    {index !== 0 && (
                      <IconButton
                        color="error"
                        onClick={() => remove(index)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  append({
                    misQfc2ColumnId: '',
                    misQfc2Condition: '',
                    misQfc2Value: '',
                    misRelation: '',
                  })
                }
              >
                Add Condition
              </Button>
            </div>
          </TabPanel>
          <TabPanel value={'RegExp'}>
            <Controller
              name={`regexp`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  //focused={!!paramId}
                  sx={{
                    minWidth: 200,
                    marginBottom: {
                      xs: 2,
                      sm: 2,
                      md: 0,
                      lg: 0,
                      xl: 0,
                    },
                  }}
                  id="standard-basic"
                  variant="standard"
                  error={!!formState.errors?.regexp}
                  onChange={onChange}
                  value={value}
                  label="Regexp"
                  helperText={formState.errors?.regexp?.message as string}
                />
              )}
            />
          </TabPanel>
        </TabContext>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" type="submit" form="reportForm">
          Confirm
        </Button>
        <Button
          onClick={() => {
            closeCurrentDialog();
            onCloseAction && onCloseAction();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyColumnConfigDialog;

export type PropertyColumnConfigDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onCloseAction?: () => void;
  onConfirmAction?: (data: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => void;
};
