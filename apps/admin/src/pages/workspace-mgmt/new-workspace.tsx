import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  Stack,
  Box,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import { WidgetItem } from 'libs/common/src/lib/api';
import { GraphicsTypeData } from 'libs/common/src/lib/constant';
import { Widget } from 'libs/common/src/lib/context';
import { useApi } from 'libs/common/src/lib/hooks';
import configStore from 'libs/common/src/lib/store/configStore';
import GridWrapper from 'libs/common/src/lib/widget/organisms/GridWrapper/GridWrapper';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Controller, useForm } from 'react-hook-form';
import { MdAdd } from 'react-icons/md';
import { RiSave3Fill } from 'react-icons/ri';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRecoilState } from 'recoil';

// const componentProperties: { key: string; title: string }[] = [
//   { key: 'My Inbox', title: 'My Inbox' },
//   { key: 'My Outbox', title: 'My Outbox' },
//   { key: 'My Subscriptions', title: 'My Subscriptions' },
//   { key: 'My Search', title: 'My Search' },
//   { key: 'Folder Browser', title: 'Folder Browser' },
//   { key: 'Search Form', title: 'Search Form' },
//   { key: 'Record List', title: 'Record List' },
//   { key: 'Properties', title: 'Properties' },
//   { key: 'Org Chart', title: 'Org Chart' },
//   { key: 'Member', title: 'Member' },
//   { key: 'Record Creation', title: 'Record Creation' },
//   { key: 'Data Dictionary', title: 'Data Dictionary' },
//   { key: 'Data Export', title: 'Data Export' },
//   { key: 'Report', title: 'Report' },
//   { key: 'Permission', title: 'Permission' },
//   { key: 'Preference', title: 'Preference' },
//   { key: 'Data Import', title: 'Data Import' },
//   { key: 'Content Creation', title: 'Content Creation' },
//   { key: 'Rendition', title: 'Rendition' },
//   { key: 'Version', title: 'Version' },
//   { key: 'AutolinkDetailpage', title: 'Autolink' },
// ];
// const componentProperties: { key: string; title: string }[] = [
// { key: 'My Inbox', title: 'My Inbox' },
// { key: 'My Outbox', title: 'My Outbox' },
// { key: 'My Subscriptions', title: 'My Subscriptions' },
// { key: 'My Search', title: 'My Search' },
// { key: 'Folder Browser', title: 'Folder Browser' },
// { key: 'Search Form', title: 'Search Form' },
// { key: 'Record List', title: 'Record List' },
// { key: 'Properties', title: 'Properties' },
// { key: 'Org Chart', title: 'Org Chart' },
// { key: 'Member', title: 'Member' },
// { key: 'Record Creation', title: 'Record Creation' },
// { key: 'Data Dictionary', title: 'Data Dictionary' },
// { key: 'Data Export', title: 'Data Export' },
// { key: 'Report', title: 'Report' },
// { key: 'Permission', title: 'Permission' },
// { key: 'Preference', title: 'Preference' },
// { key: 'Data Import', title: 'Data Import' },
// { key: 'Task Detail', title: 'Task Detail' },
// ];

const ResponsiveGridLayout = WidthProvider(Responsive);

const NewWorksapce = () => {
  const location = useLocation();
  const history = useHistory();
  const client = useApi();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onSubmit' });
  const [config, setConfig] = useRecoilState(configStore);
  const id = useMemo(() => new URLSearchParams(location.search).get('id'), [location.search]);
  console.log(id);
  const [items, setItems] = useState<
    Array<{ key: string; id: string; title: string; widgetId?: string; configId?: string }>
  >([]);
  const [queue, setQueue] = useState<Array<{ key: string; title: string }>>([]);
  const [layout, setLayout] = useState<{
    [key: string]: { i: string; x: number; y: number; w: number; h: number }[];
  }>({});
  const [currentLayout, setCurrentLayout] = useState<
    Array<{ i: string; x: number; y: number; w: number; h: number }>
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);

  const [componentProperties, setComponentProperties] = useState<
    Array<{ key: string; title: string; configId: string }>
  >([]);

  const [componentList, setComponentList] = useState(componentProperties);

  const [workflowSwitch, setWorkflowSwitch] = useState<boolean>(false);

  const getWorkflowSwitch = async () => {
    const { data: response } = await client.sysConfig.getWorkflowSwitch();
    console.log('response===========================' + response);
    setWorkflowSwitch(!response);
  };

  useEffect(() => {
    getWorkflowSwitch();
  }, []);

  const AddWorkspace = useMutation(client.workspace.addWorkspace, {
    onSuccess: () => {
      toast('Add Successfully', {
        type: 'success',
      });
      history.push(route.workspace);
    },
    onError: (error: any) => {
      console.log(error);
    },
  });

  const EditWorkspace = useMutation(client.workspace.editWorkspace, {
    onSuccess: () => {
      toast('Edit Success', {
        type: 'success',
      });
      history.push('/workspace');
    },
  });

  useQuery(
    'bi widget',
    async () => {
      const { data } = await client.biTool.getAllBiTool();
      return data;
    },
    {
      onSuccess: (data) => {
        setComponentList(
          data.map((item) => ({
            key: GraphicsTypeData.find((i) => i.key === item.misBiConfigGraphicType)?.value ?? '',
            title: item.misBiConfigName,
            configId: item.misBiConfigId,
          }))
        );
      },
    }
  );

  useQuery(
    'common widget',
    async () => {
      const { data } = await client.widget.getWidgetList();
      return data;
    },
    {
      onSuccess: (data) => {
        setComponentProperties(
          data.map((item: WidgetItem) => ({
            key: item.misBasicWidget,
            title: item.misWidgetName,
            widgetId: item.misWidgetId,
          }))
        );
      },
    }
  );

  const { isFetching, isLoading } = useQuery(
    'workspace config',
    async () => {
      const { data } = await client.workspace.selectWorkspaceWidgetById({
        id: id ?? '',
      });
      return data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setConfig(data.widgetDetail);
        console.log('config', config);
        setItems(
          data.widgets.map((item) => {
            // const component = [...componentProperties, ...componentList].find(
            //   (component) => component.key === item.misWwAlias
            // );
            // console.log("component",component);
            // //component?.title = config[component?.configId].
            // if (component) {
            //   return {
            //     ...component,
            //     id: item.layout.i,
            //     configId: item.misBiConfigId,
            //     widgetId: item.misWidgetId,
            //   };
            // }
            return {
              key: item.misWwAlias,
              title: item.misWwTitle,
              id: item.layout.i,
              configId: item.misBiConfigId,
              widgetId: item.misWidgetId,
            };
          })
        );

        if (data.widgets) {
          const defaultLayout = data.widgets.map((item) => ({
            ...item.layout,
          }));
          setLayout({
            sm: defaultLayout,
            lg: defaultLayout,
            xs: defaultLayout,
            xss: defaultLayout,
          });
        }
        reset({
          misWorkspaceId: id,
          misSortNum: data.misSortNum,
          misWorkspaceName: data.misWorkspaceName,
          misWorkspaceParentId: data.misWorkspaceParentId,
        });
      },
    }
  );
  const onSubmitHanlding = (value: any) => {
    const { misSortNum, misWorkspaceName, misWorkspaceId, misWorkspaceParentId } = value;
    if (items.length === 0) {
      toast('Worksapce cannot be empty', {
        type: 'error',
      });
      return;
    }
    if (items.length > 0 && layout) {
      console.log('Items', items);
      const widgets = items.map((item) => ({
        misWwAlias: item.key,
        misWwTitle: item.title,
        misWidgetId: item.widgetId ?? '',
        misBiConfigId: item.configId ?? '',
        layout: currentLayout
          .map((layer) => ({
            i: layer.i,
            x: layer.x,
            y: layer.y,
            w: layer.w,
            h: layer.h,
          }))
          .find((layer) => (layer.i as string) === item.id),
      }));
      if (!id) {
        return AddWorkspace.mutate({
          misWorkspaceId: null,
          misSortNum,
          misWorkspaceName,
          misWorkspaceParentId: null,
          widgets,
        });
      }
      if (id) {
        return EditWorkspace.mutate({
          misWorkspaceId,
          misSortNum,
          misWorkspaceName,
          misWorkspaceParentId,
          widgets,
        });
      }
    }
  };
  const onErrorHandling = () => {
    if (items.length === 0) {
      toast('Worksapce cannot be empty', {
        type: 'error',
      });
    }
  };

  return (
    <>
      <div>
        <Typography variant="h6">Workspace Config</Typography>
      </div>

      <Box
        sx={{ display: 'flex', padding: 2, justifyContent: 'start' }}
        component="form"
        onSubmit={handleSubmit(onSubmitHanlding, onErrorHandling)}
      >
        <Stack direction="row" spacing={2} paddingRight={2}>
          <Controller
            name="misWorkspaceName"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                variant="standard"
                error={!!errors.misWorkspaceName}
                InputLabelProps={{ shrink: !!value || isDirty }}
                onChange={onChange}
                value={value}
                label="Workspace Name"
                helperText={errors.misWorkspaceName?.message as string}
              />
            )}
          />

          <Controller
            name="misSortNum"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                variant="standard"
                error={!!errors.misSortNum}
                InputLabelProps={{ shrink: !!value || isDirty }}
                onChange={onChange}
                value={value}
                helperText={errors.misSortNum?.message as string}
                label="Sort Number"
                type="number"
                sx={{ marginY: 1 }}
              />
            )}
          />
        </Stack>

        <Stack direction="row" display={'inline-flex'} spacing={2} alignItems={'end'}>
          <Button
            variant="outlined"
            size="small"
            sx={{ maxHeight: 40 }}
            startIcon={<MdAdd />}
            onClick={() => setIsDialogOpen(true)}
          >
            Add Item
          </Button>

          <Button
            variant="contained"
            sx={{ maxHeight: 40 }}
            size="small"
            startIcon={<RiSave3Fill />}
            type="submit"
          >
            Save
          </Button>
        </Stack>
      </Box>

      {(!id || (!!id && Object.keys(layout).length > 0)) && items.length > 0 ? (
        <Paper sx={{ height: '100%' }}>
          <Typography variant="h4" sx={{ marginBottom: '40px' }}>
            {watch('misWorkspaceTitle')}{' '}
          </Typography>
          <ResponsiveGridLayout
            layouts={layout}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 6, sm: 4, xs: 2, xxs: 1 }}
            rowHeight={100}
            // isResizable={false}
            onLayoutChange={(newLayout: any, newLayouts: any) => {
              console.log(newLayouts);
              console.log(layout);
              if (!isLoading || !isFetching || !isFetching || Object.keys(layout).length > 0) {
                setLayout(newLayouts);
                setCurrentLayout(newLayout);
              }
            }}
            height={1500}
            resizeHandles={['se', 'sw', 'e', 'w']}
          >
            {items.map((widget) => {
              return (
                <GridWrapper
                  key={widget.id}
                  editMode={true}
                  onClose={() => {
                    setItems((currItems) => {
                      return currItems.filter((chosenItem) => chosenItem.id !== widget.id);
                    });
                  }}
                  title={widget.title}
                  widget={widget as Widget}
                />
              );
            })}
          </ResponsiveGridLayout>
        </Paper>
      ) : (
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>No Items</div>
        </Paper>
      )}
      <Dialog open={isDialogOpen} fullWidth>
        <DialogTitle>Add Widgets</DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Common" />
            <Tab label="BI Widget" />
          </Tabs>
          <FormGroup
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            {tab === 0 &&
              componentProperties.map((item) => (
                <FormControlLabel
                  disabled={
                    ['My Inbox', 'My Outbox', 'Task Detail'].includes(item.key)
                      ? workflowSwitch
                      : false
                  }
                  key={item.key}
                  sx={{ width: '200px' }}
                  control={
                    <Checkbox
                      defaultChecked={
                        queue.find((currentQ) => currentQ.key === item.key) !== undefined
                      }
                      onChange={(evt) => {
                        console.log(evt);
                        if (!evt.target.checked) {
                          setQueue((curr) => curr.filter((key) => key.key !== item.key));
                        } else {
                          console.log('hi');
                          setQueue((curr) => [...curr, item]);
                        }
                      }}
                    />
                  }
                  label={item.title}
                />
              ))}

            {tab === 1 &&
              componentList.map((item) => (
                <FormControlLabel
                  key={item.key}
                  sx={{ width: '200px' }}
                  control={
                    <Checkbox
                      defaultChecked={
                        queue.find((currentQ) => currentQ.key === item.key) !== undefined
                      }
                      onChange={(evt) => {
                        console.log(evt);
                        if (!evt.target.checked) {
                          setQueue((curr) => curr.filter((key) => key.key !== item.key));
                        } else {
                          console.log('hi');
                          setQueue((curr) => [...curr, item]);
                        }
                      }}
                    />
                  }
                  label={item.title}
                />
              ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsDialogOpen(false);
              setItems((curr) => [...curr, ...queue.map((item) => ({ ...item, id: nanoid(5) }))]);
              setQueue([]);
            }}
          >
            Confirm
          </Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewWorksapce;
