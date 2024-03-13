import { useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Chip, Grid, Paper } from '@mui/material';
import { TableColumn } from 'libs/common/src/lib/api';
import { typeList } from 'libs/common/src/lib/constant';
import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

const PropertyContainer = (props: { id: string; items: Array<TableColumn>; disabled: boolean }) => {
  const { id, items, disabled } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    disabled,
    id,
  });
  const sortableItems = useMemo(
    () => items.map((item) => ({ ...item, id: item.misColumnId })),
    [items]
  );
  const containerStyle = {
    background: isOver ? '#eaeaea' : undefined,
    opacity: disabled ? 0.4 : 1,
    padding: 10,
    margin: 10,
    width: '80%',
    minHeight: '30vh',
  };
  useEffect(() => {
    setNodeRef(containerRef.current);
  }, [containerRef.current]);

  return (
    <SortableContext id={id} items={sortableItems}>
      <Grid
        ref={containerRef}
        style={containerStyle}
        container
        columnSpacing={2}
        paddingX={2}
        component={Paper}
      >
        {sortableItems.map((item) => (
          <AvailableItems key={item.id} id={item.id} data={item} disabled={disabled} />
        ))}
      </Grid>
    </SortableContext>
  );
};

export default PropertyContainer;

function AvailableItems(props: { id: string; data: any; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    disabled: props.disabled || false,
    data: {
      type: 'droppable-1',
      data: props.data,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),

    opacity: isDragging ? 0 : undefined,
  };

  return (
    <Grid item ref={setNodeRef} style={style} {...attributes}>
      <Chip
        label={props.data.misColumnLabel}
        avatar={
          <Avatar>
            {typeList.find((item) => item.key === props.data?.misColumnType)?.value.slice(0, 1)}
          </Avatar>
        }
        color="primary"
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      />
    </Grid>
  );
}
