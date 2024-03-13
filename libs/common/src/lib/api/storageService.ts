import { DataResponse, PageState, SortModel } from './common';

export interface StorageDetail {
  cmsStorageId: string;
  cmsStorageName: string;
  cmsStoragePath: string;
  cmsStorageEncrypt: string;
  cmsStorageSpace: string;
  cmsStorageUsed: string;
  cmsStorageFree: string;
  cmsStorageThreshold: string;
}

export interface StorageList {
  total: number;
  data: StorageDetail[];
}

export type GetStorageListPageableResponse = DataResponse<StorageList>;

export interface GetStorageListPageableInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface DeleteStorageByIdInput {
  id: string;
}

export interface DeleteStorageByIdResponse {
  status: string;
  message: string;
  data: null;
}

export interface GetStorageDetailById {
  id: string;
}

export type GetStorageDetailByIdResponse = DataResponse<StorageDetail>;

export interface AddStorageInput {
  cmsStorageName: string;
  cmsStoragePath: string;
  cmsStorageEncrypt: string;
  cmsStorageThreshold: string;
}

export interface UpdateStorageInput {
  cmsStorageId: string;
  cmsStorageName: string;
  cmsStoragePath: string;
  cmsStorageEncrypt: string;
  cmsStorageThreshold: string;
}
