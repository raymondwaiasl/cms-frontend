import {
  DeleteDialog,
  InputDialog,
  PermissionDialog,
  ReportDialog,
  RenditionDialog,
  AutoLinkDialog,
  RoleManagementDialog,
  SubscribeDialog,
  PropertyColumnConfigDialog,
  PropertyColumnPermissionDialog,
  TipsDialog,
} from '../dialog';
import { FC, ReactNode } from 'react';

const DialogHandler = {
  roleMgmt: <RoleManagementDialog />,
  deleteDialog: <DeleteDialog />,
  tipsDialog: <TipsDialog />,
  inputDialog: <InputDialog />,
  permissionDialog: <PermissionDialog />,
  subscribeDialog: <SubscribeDialog />,
  reportDialog: <ReportDialog />,
  renditionDialog: <RenditionDialog />,
  autoLinkDialog: <AutoLinkDialog />,
  propertyColumnConfigDialog: <PropertyColumnConfigDialog />,
  propertyColumnPermissionDialog: <PropertyColumnPermissionDialog />,
};

export default DialogHandler;
