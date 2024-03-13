import { DataResponse, PaginationInput } from './common';
import exp from 'constants';

export interface OrgItems {
  misOrganizationId: string;
  misOrganizationName: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

export type GetOrgItems = DataResponse<{ data: OrgItems[] }>;

export interface SaveOrgNameInput {
  orgName: string;
}

export interface DeleteOrgInput {
  orgId: string;
}

export interface SystemConfigs {
  misSysConfigId: string;
  misSysConfigKey: string;
  misSysConfigValue: string;
  misSysConfigVisible: string;
}

export type GetSysConfigs = DataResponse<{ data: SystemConfigs[] }>;

export interface AddSysConfigInput {
  misSysConfigId: string;
  misSysConfigKey: string;
  misSysConfigValue: string;
  misSysConfigType: number;
  misSysConfigImage?: File;
  misSysConfigVisible?: number | null;
}

export interface DeleteSysConfigInput {
  misSysConfigId: string;
}

export interface FindSysConfigByKeyInput {
  misSysConfigKey: string;
}

export type FindSysConfigByKeyResponse = DataResponse<SystemConfigs>;
