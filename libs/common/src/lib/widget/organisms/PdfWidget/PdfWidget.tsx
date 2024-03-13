import PdfOutline from './PdfOutline';
import styles from './PdfWidget.module.scss';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GridViewIcon from '@mui/icons-material/GridView';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Drawer,
  IconButton,
  List,
  Grid,
  Stack,
  ListSubheader,
  Pagination,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();
type IRefProxy = {
  num: number;
  gen: number;
};
interface IOutline {
  title: string;
  bold: boolean;
  italic: boolean;
  color: Uint8ClampedArray;
  dest: string | Array<any> | null;
  url: string | null;
  unsafeUrl: string | undefined;
  newWindow: boolean | undefined;
  count: number | undefined;
  items: IOutline[];
}
const PdfWidget = () => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [outline, setOutline] = useState<IOutline[]>([]);
  const pdfInstance = useRef<DocumentCallback>();
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  async function onDocumentLoadSuccess(pdf: DocumentCallback) {
    pdfInstance.current = pdf;
    const { numPages } = pdf;
    setNumPages(numPages);

    const requestedOutline = (await pdf._transport.getOutline()) as Array<IOutline>;
    console.log(outline);
    if (outline) {
      setOutline(requestedOutline);
    }
  }

  return (
    <div>
      <input
        type="file"
        name=""
        id=""
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files) setFile(e.target.files[0]);
        }}
      />
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <IconButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MenuIcon />
          </IconButton>
          <IconButton onClick={() => setIsViewOpen(!isViewOpen)}>
            <GridViewIcon />
          </IconButton>
        </Box>
        <Drawer
          variant="permanent"
          open={isMenuOpen}
          PaperProps={{
            sx: {
              position: isMenuOpen ? 'absolute' : '',
              display: isMenuOpen ? 'block' : 'none',
            },
          }}
        >
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader
                component="div"
                id="nested-list-subheader"
                sx={{
                  position: 'sticky',
                  top: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>Outline</div>
                <IconButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <ChevronLeftIcon />
                </IconButton>
              </ListSubheader>
            }
          >
            {outline.map((item) => (
              <PdfOutline
                key={item.dest?.toString()}
                item={item}
                onClick={async (des) => {
                  const index = await pdfInstance.current?.getPageIndex(des);
                  if (typeof index === 'number') setPageNumber(index + 1);
                  setIsMenuOpen(false);
                }}
              />
            ))}
          </List>
        </Drawer>

        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {pdfInstance.current && (
            <Drawer
              variant="permanent"
              open={isViewOpen}
              anchor="right"
              PaperProps={{
                sx: {
                  right: 0,
                  left: 'auto',
                  position: isViewOpen ? 'absolute' : '',
                  display: isViewOpen ? 'block' : 'none',
                  padding: 2,
                  transition: 'ease-in',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                <IconButton onClick={() => setIsViewOpen(!isViewOpen)}>
                  <ChevronRightIcon />
                </IconButton>
                <div>Page</div>
              </Box>
              <Grid container spacing={2}>
                {pdfInstance.current &&
                  Array.from({ length: numPages ?? 0 }).map((item, i) => (
                    <Grid
                      key={i}
                      item
                      xs
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <Thumbnail
                        pageNumber={i + 1}
                        className={i + 1 === pageNumber ? styles.activePage : styles.page}
                        onItemClick={({ pageNumber }) => {
                          setPageNumber(pageNumber);
                          setIsViewOpen(false);
                        }}
                        height={50}
                      />
                      <div>{i + 1}</div>
                    </Grid>
                  ))}
              </Grid>
            </Drawer>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Page pageNumber={pageNumber} height={500} className={styles.currentView} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Pagination
              count={numPages}
              defaultPage={1}
              page={pageNumber}
              onChange={(_, num) => {
                setPageNumber(num);
              }}
              size="small"
            />
          </Box>
        </Document>
      </Box>
    </div>
  );
};

export default PdfWidget;
