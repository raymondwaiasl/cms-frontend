import { DataResponse } from './common';

export interface FolderTree {
  misFolderId: string;
  misFolderName: string;
  misFolderFullPath: any;
  misFolderParentId: string;
  misPermissionId: string;
  delFlag: string;
  createBy?: string;
  createTime: any;
  updateBy?: string;
  updateTime: any;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export type GetFolderListResponse = DataResponse<FolderTree[]>;

export interface SaveFolderInput {
  misFolderName: string;
  misFolderParentId: string;
}
export type SaveFolderResponse = DataResponse<boolean>;

export interface UpdateFolderInput {
  id: string;
  name: string;
}

export type UpdateFolderResponse = SaveFolderResponse;

export interface DeleteFolderInput {
  id: string;
}

export type DeleteFolderResponse = SaveFolderResponse;

export type GetDefaultFolderResponse = DataResponse<FolderTree>;
