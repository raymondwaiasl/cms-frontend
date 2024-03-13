import { DemoInputHandling } from '../../../../../libs/common/src/lib/utils/searchItemHandling';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, Menu, MenuItem, Paper, Slider } from '@mui/material';
import { SavePropertyColumnPermissionInput, SimpleSearchItem } from 'libs/common/src/lib/api';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { CgCloseR } from 'react-icons/cg';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MdDragHandle } from 'react-icons/md';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

const FormContainer = ({
  id,
  items,
  isEdit,
  onColChange,
  onRowChange,
  onClose,
}: {
  id: string;
  isEdit: boolean;
  onColChange: (id: string, result: number) => void;
  onRowChange: (id: string, result: number) => void;
  onClose: (id: string) => void;
  items: Array<SimpleSearchItem>;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });
  const containerStyle: CSSProperties = {
    background: isOver ? '#eaeaea' : undefined,
    margin: 10,
    width: '85vw',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gridAutoRows: '1fr',
    gap: '10px',
    padding: '16px',
  };
  useEffect(() => {
    setArr(items);
  }, [items]);
  const [arr, setArr] = useState(items);

  return (
    <SortableContext id={id} items={items}>
      <Paper ref={setNodeRef} style={containerStyle}>
        {arr.map((item, index) => (
          <SortableItem
            key={item.id}
            id={item.id}
            configDetailId={''}
            items={items}
            data={item}
            handle={isEdit}
            onColChange={onColChange}
            onRowChange={onRowChange}
            onClose={onClose}
          />
        ))}
      </Paper>
    </SortableContext>
  );
};

function SortableItem({
  handle = true,
  data,
  onColChange,
  onRowChange,
  onClose,
  ...props
}: {
  id: string;
  configDetailId: string;
  items: Array<SimpleSearchItem>;
  onColChange: (id: string, result: number) => void;
  onRowChange: (id: string, result: number) => void;
  onClose: (id: string) => void;
  handle?: boolean;
  error?: boolean;
  data: any;
}) {
  const { openDialog } = useDialog();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
    data: {
      type: 'droppable-2',
      data: data,
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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {
        <div
          style={{
            marginLeft: '10px',
          }}
        >
          {''}
        </div>
      }
      {<DemoInputHandling {...data} />}
      {handle && (
        <IconButton {...listeners}>
          <MdDragHandle />
        </IconButton>
      )}
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
                onChangeCommitted={(evt, number) => {
                  onColChange && onColChange(props.id, number as number);
                }}
                size="small"
                sx={{ width: '100px' }}
                defaultValue={data?.colSize}
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
                onChangeCommitted={(evt, number) => {
                  onRowChange && onRowChange(props.id, number as number);
                }}
                size="small"
                sx={{ width: '100px' }}
                defaultValue={data?.rowSize}
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
          </Menu>
        </>
      )}
      {handle && (
        <IconButton aria-label="delete" size="large" onClick={() => onClose(props.id)}>
          <ClearIcon fontSize="inherit" />
        </IconButton>
      )}
    </div>
  );
}

export default FormContainer;
