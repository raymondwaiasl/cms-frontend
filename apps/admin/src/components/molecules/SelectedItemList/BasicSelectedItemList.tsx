import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
} from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';

export const ItemTypes = {
  DataItem: 'data item',
};
const BasicSelectedItemList: FC<SelectedItemListProps> = ({
  getIncludeList,
  getExcludeList,
  error,
  height,
  hasSelectAll,
  onChange,
}) => {
  const [excludeList, setExcludeList] = useState<DataItem[]>(getExcludeList ?? []);
  const [includeList, setIncludeList] = useState<DataItem[]>(getIncludeList ?? []);

  useEffect(() => {
    if (getExcludeList) {
      setExcludeList(getExcludeList);
    }
    if (getIncludeList) {
      setIncludeList(getIncludeList);
    }
  }, [getExcludeList, getIncludeList]);

  useEffect(() => {
    onChange({ includeList, excludeList });
  }, [includeList, excludeList]);

  return (
    <DragDropContext
      onDragEnd={(result, provider) => {
        if (result.destination?.droppableId === result.source.droppableId) {
          console.log(result);
          if (
            result.source.droppableId === 'droppable-2' &&
            result.source.index !== result.destination.index
          ) {
            const newIncludeList = [...includeList];
            const [slicedItem] = newIncludeList.splice(result.source.index, 1);
            newIncludeList.splice(result.destination.index, 0, slicedItem);
            setIncludeList(newIncludeList);
            // onChange({ includeList, excludeList });
          }
          return;
        }
        if (result.destination?.droppableId === 'droppable-1') {
          const [popedItem] = includeList.splice(result.source.index, 1);
          const newExcludeList = excludeList;
          newExcludeList.splice(result.source.index, 0, popedItem);
          setIncludeList(includeList);
          setExcludeList(newExcludeList);
          // onChange({ includeList, excludeList });
        }
        if (result.destination?.droppableId === 'droppable-2') {
          const [popedItem] = excludeList.splice(result.source.index, 1);
          includeList.splice(result.source.index, 0, popedItem);
          setExcludeList(excludeList);
          setIncludeList(includeList);
          // onChange({ includeList, excludeList });
        }
      }}
    >
      <Box>
        {/* <Typography variant="inherit">Display Column：</Typography> */}
        <Grid container justifyContent="center" sx={{ width: '100%', height }} wrap="nowrap">
          <Grid item sx={{ height, width: '100%' }}>
            <Droppable droppableId="droppable-1">
              {(provided, snapshot) => (
                <Paper
                  sx={{
                    padding: (theme) => theme.spacing(2),
                    height: '100%',
                    minWidth: '100px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                  }}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? 'grey' : 'white',
                  }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {provided.placeholder}
                  {!!excludeList.length &&
                    excludeList.map((listItem, index) => (
                      <Draggable draggableId={listItem.id} index={index} key={listItem.id}>
                        {(provided, snapshot) => (
                          <FormControlLabel
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            label={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 0.5,
                                  pr: 0,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'inherit', flexGrow: 1 }}
                                >
                                  {listItem.name}
                                </Typography>
                              </Box>
                            }
                            control={
                              <Checkbox
                                defaultChecked={listItem.checked}
                                onClick={(event) => {
                                  if (listItem.checked) {
                                    setExcludeList(() => {
                                      excludeList[index] = {
                                        ...excludeList[index],
                                        checked: false,
                                      };
                                      return excludeList;
                                    });
                                  } else {
                                    setExcludeList(() => {
                                      excludeList[index] = {
                                        ...excludeList[index],
                                        checked: true,
                                      };
                                      return excludeList;
                                    });
                                  }
                                }}
                              />
                            }
                          />
                        )}
                      </Draggable>
                    ))}
                </Paper>
              )}
            </Droppable>
          </Grid>
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid
              container
              direction="column"
              sx={{
                padding: (theme) => theme.spacing(2),
                gap: (theme) => theme.spacing(2),
              }}
            >
              {hasSelectAll ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setExcludeList((current) => [
                      ...current,
                      ...includeList.map((listItem) => ({
                        id: listItem.id,
                        name: listItem.name,
                        type: listItem.type,
                      })),
                    ]);
                    setIncludeList([]);
                  }}
                >
                  <BsChevronDoubleLeft />
                </Button>
              ) : (
                ''
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  const excludeSelectionList = includeList
                    .filter((listItem) => listItem.checked)
                    .map((listItem) => ({
                      ...listItem,
                      checked: false,
                    }));
                  setIncludeList(
                    includeList
                      .filter((listItem) => !listItem.checked)
                      .map((listItem) => ({
                        ...listItem,
                        checked: false,
                      }))
                  );
                  setExcludeList((curr) => [...curr, ...excludeSelectionList]);
                }}
              >
                <BsChevronLeft />
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const includeSelectionList = excludeList
                    .filter((listItem) => listItem.checked)
                    .map((listItem) => ({
                      ...listItem,
                      checked: false,
                    }));
                  setExcludeList(
                    excludeList
                      .filter((listItem) => !listItem.checked)
                      .map((listItem) => ({
                        ...listItem,
                        checked: false,
                      }))
                  );
                  setIncludeList((curr) => [...curr, ...includeSelectionList]);
                }}
              >
                <BsChevronRight />
              </Button>
              {hasSelectAll ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIncludeList((curr) => [
                      ...curr,
                      ...excludeList.map((listItem) => ({
                        ...listItem,
                        checked: false,
                      })),
                    ]);
                    setExcludeList([]);
                  }}
                >
                  <BsChevronDoubleRight />
                </Button>
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Grid item sx={{ height, width: '100%' }}>
            <Droppable droppableId="droppable-2">
              {(provided, snapshot) => (
                <Paper
                  sx={{
                    padding: (theme) => theme.spacing(2),
                    height: '100%',
                    minWidth: '100px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                  }}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? 'grey' : 'white',
                  }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {provided.placeholder}
                  {!!includeList.length &&
                    includeList.map((listItem, index) => (
                      <Draggable draggableId={listItem.id} index={index} key={listItem.id}>
                        {(provided, snapshot) => (
                          <FormControlLabel
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            label={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 0.5,
                                  pr: 0,
                                }}
                              >
                                {/* <Box component={levelIcon[listItem.type]} color="inherit" sx={{ mr: 1 }} /> */}
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'inherit', flexGrow: 1 }}
                                >
                                  {listItem.name}
                                </Typography>
                              </Box>
                            }
                            control={
                              <Checkbox
                                defaultChecked={listItem.checked}
                                onClick={(event) => {
                                  if (listItem.checked) {
                                    setIncludeList(() => {
                                      includeList[index] = {
                                        ...includeList[index],
                                        checked: false,
                                      };
                                      return includeList;
                                    });
                                  } else {
                                    setIncludeList(() => {
                                      includeList[index] = {
                                        ...includeList[index],
                                        checked: true,
                                      };
                                      return includeList;
                                    });
                                  }
                                }}
                              />
                            }
                          />
                        )}
                      </Draggable>
                    ))}
                </Paper>
              )}
            </Droppable>
            {error && (
              <FormHelperText error aria-label="selectItem-error">
                {error}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Box>
    </DragDropContext>
  );
};

export default BasicSelectedItemList;

export interface DataItem {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

export type confirmProps = {
  excludeList: DataItem[];
  includeList: DataItem[];
};

export type SelectedItemListProps = {
  error?: string;
  onChange: (props: confirmProps) => void;
  getExcludeList?: DataItem[];
  getIncludeList?: DataItem[];
  height?: string;
  hasSelectAll?: boolean;
};
