import { PaginationInput, DataResponse, PageState, SortModel } from './common';

export interface deleteVersionInput {
  cmsVersionId: string;
  misTypeId: string;
  misRecordId: string;
}
export interface uploadVersionInput {
  files: File;
  misTypeId: string;
  misRecordId: string;
  cmsVersionNo: string;
  cmsFileLocation: string;
}
export interface downloadInput {
  isDisabled: boolean;
  misTypeId: string;
  misRecordId: string;
  versionId: string;
  downFile: string;
}

export interface GetVersionListPageableInput {
  recordId: string;
  pageState: PageState;
  sortModel: SortModel;
}
export interface VersionInfo {
  cmsVersionNo: string;
  cmsCreationDate: string;
  cmsUserName: string;
  versionStatus: string;
}
export interface isUploadInput {
  identifiler: string;
}
export interface mergeChumksInput {
  filename: string;
  identifier: string;
  totalSize: BigInteger;
  misTypeId: string;
  misRecordId: string;
  cmsVersionNo: string;
  cmsFileLocation: string;
  fileSize: string;
}
export interface downloadChunkInput {
  range: string;
  isDisabled: boolean;
  misTypeId: string;
  misRecordId: string;
  versionId: string;
  downFile: string;
  fileSize: string;
}
export type GetVersionListPageResponse = DataResponse<{
  data: GetVersionListPageableInput[];
  total: number;
}>;
