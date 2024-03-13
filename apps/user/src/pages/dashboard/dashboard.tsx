import { LayoutContext } from '../../components/layout/layout';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Widget } from 'libs/common/src/lib/context';
import WidgetHandler from 'libs/common/src/lib/context/WidgetHandler';
import { useApi, useWidget } from 'libs/common/src/lib/hooks';
import configStore from 'libs/common/src/lib/store/configStore';
import GridWrapper from 'libs/common/src/lib/widget/organisms/GridWrapper/GridWrapper';
import { useEffect, useState, useRef, useContext } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage = () => {
  const { t } = useTranslation();
  const setConfig = useSetRecoilState(configStore);
  const { headerHeight } = useContext(LayoutContext);
  const history = useHistory();
  const { setTitle, breadCrumbs } = useContext(WorkspaceContext);
  const client = useApi();
  // const [open, setOpen] = useState(false);
  // const anchorRef = useRef<HTMLButtonElement>(null);
  // const titleRef = useRef<HTMLDivElement>(null);
  // const bodyRef = useRef<HTMLDivElement>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { widgets, closeWidget, setWidgets } = useWidget();
  const [layout, setLayout] = useState<{ [key: string]: any }>();
  // const [height, setHeight] = useState<number>(0);
  const [hidden, setHidden] = useState<Widget[]>([]);
  const { title } = useContext(WorkspaceContext);
  const multiWidgetMode = true;



  

  // const handleClose = (event: Event) => {
  //   if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
  //     return;
  //   }
  //   setOpen(false);
  // };
  // const handleToggle = () => {
  //   setOpen((prevOpen) => !prevOpen);
  // };
  const { isRefetching, isLoading } = useQuery(
    ['dataWidget', id],
    async () => {
      const { data } = await client.workspace.selectWorkspaceWidgetById({ id });
      return data;
    },
    {
      onSuccess: ({ widgets: widgetList, misWorkspaceName, widgetDetail }) => {
        setTitle && setTitle(misWorkspaceName);
        setConfig((prev) => ({ ...prev, ...widgetDetail }));
        setWidgets(
          widgetList.map((item) => {
            return {
              key: item.misWwAlias as keyof typeof WidgetHandler,
              title: item.misWwTitle || item.misWwAlias,
              id: item.layout.i,
              configId: item.misBiConfigId,
              widgetId: item.misWidgetId,
            };
          })
        );

        //localStorage.removeItem('layout');
        if (!localStorage.getItem('layout')) {
          console.log('why are your running');
          setLayout({
            ...layout,
            [id]: {
              xs: widgetList.map((item) => ({ ...item.layout, minW: 2 })),
              xxs: widgetList.map((item) => ({ ...item.layout, minW: 2 })),
              md: widgetList.map((item) => ({ ...item.layout, minW: 4 })),
              lg: widgetList.map((item) => ({ ...item.layout, minW: 4 })),
            },
          });
        }
        if (
          !!JSON.parse(localStorage.getItem('layout') as any) &&
          !JSON.parse(localStorage.getItem('layout') as any)[id]
        ) {
          setLayout({
            ...JSON.parse(localStorage.getItem('layout') as any),
            [id]: {
              xs: widgetList.map((item) => ({ ...item.layout, minW: 2 })),
              xxs: widgetList.map((item) => ({ ...item.layout, minW: 2 })),
              md: widgetList.map((item) => ({ ...item.layout, minW: 4 })),
              lg: widgetList.map((item) => ({ ...item.layout, minW: 4 })),
            },
          });
        }
      },
    }
  );
  useEffect(() => {
    setLayout(JSON.parse(localStorage.getItem('layout') as any) ?? {});
    setIsDraggable(false);
    return () => {
      setHidden([]);
    };
  }, [id]);
  // useEffect(() => {
  //   if (bodyRef.current && titleRef?.current) {

  //     setHeight(bodyRef?.current.offsetHeight - titleRef?.current.offsetHeight)
  //   }
  // }, [bodyRef?.current, titleRef?.current]);

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'auto',
        height: `calc(100% - ${headerHeight}px)`,
        paddingTop: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{ marginBottom: '20px', fontSize: '30px', lineHeight: '40px', fontWeight: 400 }}
        >
          {title}
        </Typography>
        <Breadcrumbs>
          {breadCrumbs.map((item, index) => (
            <Link
              key={`${item.name}-${index}`}
              underline="hover"
              color="inherit"
              onClick={() => history.push(item.to)}
            >
              {item.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      {!(isLoading || isRefetching) &&
        widgets.length > 0 &&
        !!layout &&
        (widgets.length > 1 ? (
          <Box
            sx={{
              paddingBottom: '64px',
            }}
          >
            {multiWidgetMode ? (
              <ResponsiveGridLayout
                layouts={layout[id]}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 6, sm: 3, xs: 2, xxs: 1 }}
                // isResizable={false}
                rowHeight={100}
                onLayoutChange={(layoutConfig: any, newLayouts: any) => {
                  const newLayout = layout;
                  newLayout[id] = newLayouts;
                  if (!isLoading || !isRefetching) {
                    setLayout(newLayout);
                    localStorage.setItem('layout', JSON.stringify(newLayout));
                  }
                }}
              >
                {widgets.map((widget) => (
                  <GridWrapper
                    title={widget.title}
                    showTitleBar={true}
                    key={widget.id}
                    onClose={() => {
                      closeWidget(widget.id);
                      setHidden((hiddenItem) => {
                        hiddenItem.push(widget);
                        return hiddenItem;
                      });
                    }}
                    widget={widget}
                  />
                ))}
              </ResponsiveGridLayout>
            ) : (
              <>
                {widgets.map((widget) => (
                  <GridWrapper
                    title={widget.title}
                    showTitleBar={true}
                    key={widget.id}
                    onClose={() => {
                      closeWidget(widget.id);
                      setHidden((hiddenItem) => {
                        hiddenItem.push(widget);
                        return hiddenItem;
                      });
                    }}
                    widget={widget}
                  />
                ))}
              </>
            )}
          </Box>
        ) : (
          widgets.map((widget) => (
            <GridWrapper
              showTitleBar={false}
              key={widget.id}
              multiWidgetMode={false}
              onClose={() => {
                closeWidget(widget.id);
                setHidden((hiddenItem) => {
                  hiddenItem.push(widget);
                  return hiddenItem;
                });
              }}
              widget={widget}
            />
          ))
        ))}
    </Box>
  );
};

export default DashboardPage;
