import { Paper } from '@mui/material';
import { PdfWidget } from 'libs/common/src/lib/widget';
import { useRef } from 'react';

function DemoPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Paper>
        <PdfWidget />
      </Paper>
    </div>
  );
}

export default DemoPage;
