import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Pagination,
  Button,
} from '@mui/material';
import { useState } from 'react';

const PdfOutline = ({
  onClick,
  item,
  level = 0,
}: {
  onClick: (destination: IRefProxy) => void;
  item: IOutline;
  level?: number;
}) => {
  const [isOpen, setIsOpen] = useState(level === 0);

  return (
    <>
      <ListItemButton key={item.dest?.toString()} sx={{ borderBottom: '1px solid #eaeaea' }}>
        {item.items.length > 0 && (
          <IconButton
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}

        <ListItemText
          primary={item.title}
          sx={{ pl: 3 * level }}
          onClick={() => {
            if (item.dest) {
              onClick(item.dest[0] as IRefProxy);
            }
          }}
        />
      </ListItemButton>

      {item.items.length > 0 && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{
              boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
            }}
          >
            {item.items.map((i) => (
              <PdfOutline
                key={i.dest?.toString()}
                item={i}
                level={level + 1}
                onClick={() => {
                  console.log(i.dest);
                  if (i.dest) {
                    onClick(i.dest[0] as IRefProxy);
                  }
                }}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default PdfOutline;
interface IOutline {
  title: string;
  bold: boolean;
  italic: boolean;
  /**
   * - The color in RGB format to use for
   * display purposes.
   */
  color: Uint8ClampedArray;
  dest: string | Array<any> | null;
  url: string | null;
  unsafeUrl: string | undefined;
  newWindow: boolean | undefined;
  count: number | undefined;
  items: IOutline[];
}
type IRefProxy = {
  num: number;
  gen: number;
};
//     async () => {
//     if (pdfInstance.current && item.dest) {
//         setNumPages(

//             await pdfInstance.current._transport.getPageIndex(item?.dest[0])
//         )
//     }
// }
