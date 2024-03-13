import { SaveSearchFormInput } from '../../../api';
import { QueryTableDetail, DicItem } from '../../../api';
import { ConditionArr, DefaultFolderId } from '../../../constant';
import CrossRefCondition from './CrossRefCondition';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  FormControl,
  InputLabel,
  Select,
  IconButton,
  FormHelperText,
  MenuItem,
  RadioGroup,
  TextField,
  FormLabel,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Radio,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';

const CrossRef = ({
  index,
  crossRefOption,
  tableList,
  crossRefShowItems,
  crossRefColumnList,
  onTableChange,
  onDialogOpen,
  onCrossRefRemove,
}: {
  index: number;
  crossRefOption: DicItem[];
  tableList: QueryTableDetail[];
  crossRefShowItems: QueryTableDetail[];
  crossRefColumnList: QueryTableDetail[];
  onTableChange: (id: string, index: number) => void;
  onDialogOpen: () => void;
  onCrossRefRemove: (index: number) => void;
}) => {
  // useEffect(() => {
  //     console.log(crossRefColumnList);
  //     if (crossRefOption) {
  //         setOption(crossRefOption);
  //     }
  //     if (crossRefColumnList) {
  //         setColumnList(crossRefColumnList);
  //     }
  //     // if (crossRefShowItems) {
  //     //     setShowItems(crossRefShowItems)
  //     // }
  // }, [crossRefOption, crossRefColumnList, crossRefShowItems]);
  // const [option, setOption] = useState<DicItem[]>([]);
  // const [showItems, setShowItems] = useState<QueryTableDetail[]>([])
  // const [columnList, setColumnList] = useState<QueryTableDetail[]>([]);
  const { formState, control, getValues } =
    useFormContext<Omit<SaveSearchFormInput, 'misQfGroupId' | 'misQfPublic'>>();
  // const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
  //     control, // control props comes from useForm (optional: if you are using FormContext)
  //     name: "crossRef", // unique name for your Field Array
  //   });
  const {
    fields: qfColumnsFeilds,
    append,
    remove,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: `crossRef.${index}.qfConditions`, // unique name for your Field Array
  });

  return (
    <div
      style={{
        position: 'relative',
        borderTop: '1px solid #eaeaea',
        paddingTop: '16px',
        marginBottom: '16px',
      }}

      // key={ref.id}
    >
      <IconButton
        aria-label="delete"
        size="small"
        onClick={() => onCrossRefRemove(index)}
        sx={{ position: 'absolute', right: '0' }}
      >
        <ClearIcon fontSize="small" />
      </IconButton>
      <Controller
        name={`crossRef.${index}.misQfTableId`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormControl
            variant="standard"
            sx={{ m: 1, minWidth: 200 }}
            error={!!formState.errors?.crossRef?.[index]?.misQfTableId}
          >
            <InputLabel shrink={!!value}>Table</InputLabel>
            <Select
              displayEmpty
              notched={!!value}
              renderValue={(newVal) => tableList?.find((item) => item.key === newVal)?.value}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={value /*?? queryFormDetail?.misQfTableId*/}
              defaultValue={`crossRef.${index}.misQfTableId` ?? ''}
              onChange={(e) => {
                // refreshCrossRef(e.target.value, index);
                onTableChange(e.target.value, index);
                onChange(e);
              }}
              // disabled={!!paramId}
            >
              {crossRefOption.map((i) => {
                return (
                  <MenuItem key={i.key} value={i.key}>
                    {i.value}
                  </MenuItem>
                );
              })}
            </Select>

            <FormHelperText>
              {formState.errors?.crossRef?.[index]?.misQfTableId?.message}
            </FormHelperText>
          </FormControl>
        )}
      />

      {!!crossRefShowItems.length && (
        <FormControl error={!!formState.errors?.crossRef?.[index]?.qfColumns}>
          <FormLabel component="legend">Show Items</FormLabel>
          <div>
            {crossRefShowItems?.map((option: any, i) => {
              return (
                i < 5 && (
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={
                      <Controller
                        // name="qfColumns"
                        name={`crossRef.${index}.qfColumns`}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  onChange={(_, checked) => {
                                    if (value) {
                                      checked
                                        ? onChange([
                                            ...value,
                                            {
                                              misQfId: '',
                                              misQfcColumnId: option.key,
                                              misQfcId: '',
                                            },
                                          ])
                                        : onChange(
                                            value.filter(
                                              (item) => item.misQfcColumnId !== option.key
                                            )
                                          );
                                    }
                                  }}
                                  checked={
                                    !!getValues(`crossRef.${index}.qfColumns`)?.find(
                                      (item) => item?.misQfcColumnId === option.key
                                    )
                                  }
                                />
                              }
                              label={option.value}
                            />
                          );
                        }}
                        control={control}
                      />
                    }
                    label={option.label}
                    key={option.value}
                  />
                )
              );
            })}
            {crossRefShowItems.length > 5 && (
              <Button endIcon={<MoreHorizIcon />} onClick={onDialogOpen}>
                show more
              </Button>
            )}
          </div>

          <FormHelperText>
            {formState.errors?.crossRef?.[index]?.qfColumns?.message as string}
          </FormHelperText>
        </FormControl>
      )}
      {qfColumnsFeilds?.map((condition, cIndex) => {
        return (
          <CrossRefCondition
            key={condition.id}
            index={index}
            cIndex={cIndex}
            crossRefColumnList={crossRefColumnList}
            onConditionRemove={() => remove(cIndex)}
          />
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
  );
};

export default CrossRef;
