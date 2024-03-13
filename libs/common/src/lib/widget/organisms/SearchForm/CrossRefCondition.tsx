import { SaveSearchFormInput, QueryTableDetail } from '../../../api';
import { ConditionArr } from '../../../constant';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Stack,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Button,
  TextField,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

const CrossRefCondition = ({
  index,
  cIndex,
  onConditionRemove,
  crossRefColumnList,
}: {
  index: number;
  cIndex: number;
  onConditionRemove: () => void;
  crossRefColumnList: QueryTableDetail[];
}) => {
  const { formState, trigger, control } =
    useFormContext<Omit<SaveSearchFormInput, 'misQfGroupId' | 'misQfPublic'>>();

  return (
    <div>
      <Stack
        direction="row"
        mb={3}
        // key={field.id}
        flexWrap="wrap"
        justifyContent={'start'}
        alignItems={'center'}
        sx={{
          width: '100%',
          position: 'relative',
          padding: '20px',
          borderRadius: '20px',
          backgroundColor: cIndex % 2 !== 0 ? '#F3F6F5' : undefined,
        }}
      >
        {cIndex !== 0 && (
          <Controller
            name={`crossRef.${index}.qfConditions.${cIndex}.misRelation`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                error={!!formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misRelation}
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
                    formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misRelation
                      ?.message as string
                  }
                </FormHelperText>
              </FormControl>
            )}
          />
        )}

        <Controller
          name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2ColumnId`}
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
              error={!!formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2ColumnId}
            >
              <InputLabel id="demo-simple-select-standard-label">Column Name</InputLabel>
              <Select
                autoWidth
                displayEmpty
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                renderValue={(newVal) =>
                  crossRefColumnList?.find((item) => item.key === newVal)?.value
                }
                value={value}
                defaultValue={''}
                onChange={onChange}
              >
                {crossRefColumnList.map((item) => {
                  return (
                    <MenuItem key={item.key} value={item.key}>
                      {item.value}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText>
                {
                  formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2ColumnId
                    ?.message as string
                }
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Condition`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl
              //focused={!!paramId}
              variant="standard"
              sx={{
                marginBottom: {
                  xs: 1,
                  sm: 1,
                  md: 0,
                  lg: 0,
                  xl: 0,
                },
                marginRight: {
                  xs: 0,
                  sm: 0,
                  md: 2,
                  lg: 2,
                  xl: 2,
                },
                minWidth: 200,
              }}
              error={
                !!formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Condition
              }
            >
              <InputLabel id="demo-simple-select-standard-label">Condition</InputLabel>
              <Select
                autoWidth
                displayEmpty
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                renderValue={(newVal) =>
                  ConditionArr?.find((item) => item.key === newVal)?.value ??
                  ConditionArr?.find(
                    (item) =>
                      item.key === `crossRef.${index}.qfConditions.${cIndex}.misQfc2Condition`
                  )?.value
                }
                value={value ?? `crossRef.${index}.qfConditions.${cIndex}.misQfc2Condition`}
                defaultValue={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Condition` ?? ''}
                onChange={onChange}
              >
                {ConditionArr?.map((item) => {
                  return (
                    <MenuItem key={item.key} value={item.key}>
                      {item.value}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText>
                {
                  formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2ColumnId
                    ?.message as string
                }
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Value`}
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
              error={!!formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Value}
              onChange={onChange}
              defaultValue={`crossRef.${index}.qfConditions.${cIndex}.misQfc2Value` ?? ''}
              value={value}
              label="Value"
              helperText={
                formState.errors?.crossRef?.[index]?.qfConditions?.[cIndex]?.misQfc2Value
                  ?.message as string
              }
            />
          )}
        />
        {cIndex !== 0 && (
          <IconButton
            color="error"
            onClick={onConditionRemove}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
            }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        )}
      </Stack>
    </div>
  );
};

export default CrossRefCondition;
