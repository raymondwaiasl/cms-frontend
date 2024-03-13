import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { Widget } from 'libs/common/src/lib/context';
import { useWidget } from 'libs/common/src/lib/hooks';
import GridWrapper from 'libs/common/src/lib/widget/organisms/GridWrapper/GridWrapper';
import { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const initialLayout = {
  lg: [
    { i: 'Org Chart', x: 0, y: 0, w: 2, h: 1 },
    { i: 'Group Management', x: 1, y: 0, w: 2, h: 2 },
  ],
};

const HomePage = () => {
  const { closeWidget } = useWidget();
  const [isDraggable, setIsDraggable] = useState(false);
  const [layout, setLayout] = useState<any>(
    JSON.parse(localStorage.getItem('layout') as any) ?? initialLayout
  );

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <FormGroup sx={{ alignItems: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                onChange={() => setIsDraggable((curr) => !curr)}
                checked={isDraggable}
                size="small"
              />
            }
            label="Edit Mode"
          />
        </FormGroup>
        <ResponsiveGridLayout
          layouts={layout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 6, sm: 3, xs: 2, xxs: 1 }}
          rowHeight={300}
          onLayoutChange={(newLayout: any, newLayouts: any) => {
            setLayout(newLayouts);
            localStorage.setItem('layout', JSON.stringify(newLayouts));
          }}
          height={1500}
          isDraggable={isDraggable}
          resizeHandles={['se', 'sw']}
        >
          {/* {[
            { key: 'AutolinkDetailpage', title: 'Autolink', data: null },

            { key: 'Folder Browser', title: 'Folder Browser', data: null },
            {
              id: 'Org Chart',
              key: 'Org Chart',
              title: 'Org Chart',
              layout: { i: 'Org Chart', x: 0, y: 0, w: 2, h: 1 },
            },
            {
              id: 'Member',
              key: 'Member',
              title: 'Member',
              layout: { i: 'Member', x: 0, y: 0, w: 2, h: 1 },
            },
            {
              id: 'Folder Browser',
              key: 'Folder Browser',
              title: 'Folder Browser',
              layout: { i: 'Folder Browser', x: 0, y: 0, w: 2, h: 1 },
            },
          ].map((item) => (
            <GridWrapper
              key={item.key}
              onClose={() => {
                closeWidget(item.key);
              }}
              widget={item as Widget}
            />
          ))} */}
        </ResponsiveGridLayout>
      </Box>
    </>
  );
};

export default HomePage;
