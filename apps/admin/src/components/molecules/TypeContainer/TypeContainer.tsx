import { useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Chip, Grid, Paper } from '@mui/material';
import { typeList } from 'libs/common/src/lib/constant';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const TypeContainer = (props: { id: string; items: Array<{ id: string }> }) => {
  const { id, items } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id,
  });
  const containerStyle = {
    background: isOver ? '#eaeaea' : undefined,
    padding: 10,
    margin: 10,
    width: '80%',
    minHeight: '30vh',
  };
  useEffect(() => {
    setNodeRef(containerRef.current);
  }, [containerRef.current]);

  return (
    <SortableContext id={id} items={items}>
      <Grid
        ref={containerRef}
        style={containerStyle}
        container
        columnSpacing={2}
        paddingX={2}
        component={Paper}
      >
        {items.map((item: { id: string }) => (
          <AvailableItems key={item.id} id={item.id} data={item} />
        ))}
      </Grid>
    </SortableContext>
  );
};

export default TypeContainer;

function AvailableItems(props: { id: string; data: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    data: {
      type: 'droppable-3',
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
        label={props.data?.name}
        avatar={
          <Avatar>{typeList.find((item) => item.key === props.data?.id)?.value.slice(0, 1)}</Avatar>
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
