import { useDroppable } from '@dnd-kit/core';
import { useDndMonitor } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconButton, Menu, MenuItem, Paper, Slider, Box } from '@mui/material';
import { IPropertyDetailInput } from 'apps/admin/src/pages/property-page/property-detail-page';
import { IPropertyConfigCols, SavePropertyColumnPermissionInput } from 'libs/common/src/lib/api';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { DemoInputHandling } from 'libs/common/src/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MdDragHandle } from 'react-icons/md';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

const FormContainer = <T extends object>({
  index,
  isEdit,
  onDelete,
  sectionId,
}: {
  index: number;
  isEdit: boolean;
  sectionId: string;
  onDelete: (item: any) => void;
}) => {
  const { control } = useFormContext<IPropertyDetailInput>();
  const { fields, update, remove, append, swap } = useFieldArray({
    control,
    name: `propertyConfigDetails.${index}.columns`,
  });
  const { setNodeRef, isOver } = useDroppable({
    id: `propertyConfigDetails.${index}.columns`,
  });
  useDndMonitor({
    onDragEnd: (event) => {
      console.log(event);
      if (
        !event?.over?.data.current &&
        event.active.data.current?.type === 'droppable-1' &&
        event.over?.id !== 'droppable-1'
      ) {
        append({
          ...event.active.data.current?.data,
          misColumnLabel: event.active.data.current?.data.misColumnLabel,
          misPropertyConfigDetailColumnId: event.active.data.current?.data.misColumnId,
          misColumnInputType: event.active.data.current?.data.misColumnInputType,
          misPropertySectionId: event.active.data.current?.data.misPropertySectionId ?? sectionId,
          colSize: 3,
          rowSize: 1,
        } as IPropertyConfigCols & { misColumnLabel: string; misColumnInputType: string });
      }
      if (
        !event?.over?.data.current &&
        event.active.data.current?.type !== 'droppable-1' &&
        event.over?.id === 'droppable-1'
      ) {
        remove(event.active.data.current?.index);
      }
      if (event?.over?.data.current && event.active.data.current?.type !== 'droppable-1') {
        if (
          event.over?.data.current &&
          typeof event.over.data.current?.index === 'number' &&
          typeof event.active.data.current?.index === 'number'
        )
          swap(event.active.data.current?.index, event.over.data.current?.index);
        return;
      }
    },
  });
  const containerStyle: CSSProperties = {
    background: isOver ? '#eaeaea' : undefined,
    margin: 10,
    width: '70vw',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gridAutoRows: '1fr',
    gap: '10px',
    padding: '16px',
  };
  // useEffect(() => {
  //   setArr(items);
  // }, [items]);
  // const [arr, setArr] = useState(items);

  return (
    <SortableContext id={`propertyConfigDetails.${index}.columns`} items={fields}>
      <Paper sx={{ height: '100%', minHeight: '20vh', background: isOver ? '#eaeaea' : undefined }}>
        <Box ref={setNodeRef} style={containerStyle}>
          {fields.map((item, fIndex) => (
            <SortableItem
              key={item.id}
              SIndex={fIndex}
              type={`propertyConfigDetails.${index}.columns`}
              id={`propertyConfigDetails.${index}.columns.${fIndex}`}
              // configDetailId={item.misPropertyConfigDetailId ?? ''}
              data={item}
              handle={isEdit}
              onColChange={(result) => {
                console.log(result);
                update(fIndex, { ...item, colSize: result });
              }}
              onRowChange={(result) => {
                console.log(result);
                update(fIndex, { ...item, rowSize: result });
              }}
              onDelete={() => {
                remove(fIndex);
                onDelete(item);
              }}
            />
          ))}
        </Box>
      </Paper>
    </SortableContext>
  );
};

function SortableItem({
  handle = true,
  data,
  onColChange,
  onRowChange,
  ...props
}: {
  id: string;
  type: string;
  SIndex: number;
  configDetailId?: string;
  onColChange: (result: number) => void;
  onRowChange: (result: number) => void;
  onDelete: () => void;
  handle?: boolean;
  error?: boolean;
  data: any;
}) {
  const { openDialog } = useDialog();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
    data: {
      type: props.type,
      data: data,
      index: props.SIndex,
    },
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    minHeight: '100px',
    display: 'flex',
    gridColumn: `span ${data?.colSize}`,
    gridRow: `span ${data?.rowSize}`,
    border: handle ? '1px solid black' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDragging ? 0.7 : undefined,
    padding: handle ? '10px 0' : undefined,
  };

  const client = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [colSize, setColSize] = useState<number>(data.colSize ?? 1);
  const [rowSize, setRowSize] = useState<number>(data.rowSize ?? 1);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const SaveColumnPermissionInput = useMutation(client.property.savePropertyColumnPermission, {
    onSuccess: () => {
      //queryClient.invalidateQueries('Folder Subscribe');
      //queryClient.invalidateQueries('Properties');
      //queryClient.invalidateQueries('PropertiesRef');
      toast('Save column permission successfully');
    },
  });
  console.log(data);
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {handle && (
        <IconButton {...listeners}>
          <MdDragHandle />
        </IconButton>
      )}
      {<DemoInputHandling {...data} />}
      {handle && (
        <>
          <IconButton onClick={handleClick}>
            <HiOutlineDotsVertical />
          </IconButton>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem
              sx={{
                padding: 2,
                //   width: '200px'
              }}
            >
              <div
                style={{
                  marginRight: '20px',
                }}
              >
                Column Size
              </div>
              <Slider
                onChangeCommitted={(_, number) => {
                  onColChange && onColChange(number as number);
                }}
                onChange={(_, number) => {
                  setColSize(number as number);
                }}
                size="small"
                sx={{ width: '100px' }}
                value={colSize}
                aria-label="Small"
                min={1}
                max={12}
                valueLabelDisplay="on"
              />
              <div
                style={{
                  marginLeft: '20px',
                }}
              >
                {data?.colSize}
              </div>
            </MenuItem>

            <MenuItem
              sx={{
                padding: 2,
                //   width: '200px'
              }}
            >
              <div
                style={{
                  marginRight: '20px',
                }}
              >
                Row Size
              </div>
              <Slider
                onChangeCommitted={(_, number) => {
                  console.log(number);
                  onRowChange && onRowChange(number as number);
                }}
                onChange={(_, number) => {
                  setRowSize(number as number);
                }}
                size="small"
                sx={{ width: '100px' }}
                value={rowSize}
                aria-label="Small"
                min={1}
                max={4}
                valueLabelDisplay="on"
              />
              <div
                style={{
                  marginLeft: '20px',
                }}
              >
                {data?.rowSize}
              </div>
            </MenuItem>
            <MenuItem
              sx={{
                padding: 2,
                color: (theme) => theme.palette.error.main,
                //   width: '200px'
              }}
              onClick={() => props.onDelete()}
            >
              Delete Column
            </MenuItem>
            {/* <MenuItem
              sx={{
                padding: 2,
                //   width: '200px'
              }}
              onClick={() =>
                openDialog('propertyColumnConfigDialog', {
                  columnId: props.id,
                  columnConfigId: props.configDetailId,
                  items: props.items,
                })
              }
            >
              <div
                style={{
                  marginRight: '20px',
                }}
              >
                Detail Setting
              </div>
            </MenuItem>

            <MenuItem
              sx={{
                padding: 2,
                //   width: '200px'
              }}
              onClick={() =>
                openDialog('propertyColumnPermissionDialog', {
                  columnId: props.id,
                  columnConfigId: props.configDetailId,
                  items: props.items,
                  onConfirmAction: (
                    params: Omit<SavePropertyColumnPermissionInput, 'columnConfigId'>
                  ) => SaveColumnPermissionInput.mutate(params),
                })
              }
            >
              <div
                style={{
                  marginRight: '20px',
                }}
              >
                Permission Setting
              </div>
            </MenuItem> */}
          </Menu>
        </>
      )}
    </div>
  );
}

export default FormContainer;
