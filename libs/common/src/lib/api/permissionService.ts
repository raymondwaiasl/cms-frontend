import { DataResponse, PaginationInput } from './common';

export interface QueryGroupData {
  id: string;
  name: string;
}

export interface QueryGroupDataInput {
  id: '3' | '4';
}
export type QueryGroupDataResponse = DataResponse<QueryGroupData[]>;
export interface GetGroupData {
  key: string;
  value: string;
}
export interface GetGroupDataInput {
  id: string;
}
export type GetGroupDataResponse = DataResponse<GetGroupData[]>;

export interface queryFolderPermission {
  misPermissionId: string;
  misPermissionName: string;
  misPermissionType: '1' | '2';
  details: queryFolderPermissionDetail[];
}
export interface queryFolderPermissionDetail {
  misPdId: string;
  misPermissionId: string;
  misPdType: QueryGroupDataInput['id'];
  misPdPerformerId: string;
  misPdRight: '7' | '5' | '0';
}

export type QueryFolderPermissionInput = {
  id: string;
};
export type QueryFolderPermissionResponse = DataResponse<queryFolderPermission>;

export type SavePermissionDataInput = {
  folderId: string;
  folderPer: '1' | '2';
  permission: queryFolderPermission;
};
export type SavePermissionDataResponse = DataResponse<string>;
export type DelPermissionDataResponse = DataResponse<string>;

export type DelPermissionDataInput = QueryFolderPermissionInput;

export interface QueryRecordPermissionInput {
  typeId: string;
  recordId: string;
}

export type QueryAllGroupDataInput = PaginationInput;
export type GetAllGroupResponse = DataResponse<{ data: QueryGroupData[]; total: number }>;
