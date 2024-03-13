import { PaginationInput, DataResponse, PageState, SortModel } from './common';

export interface autoLinkInput {
  selectTable: string;
  checked: boolean;
  selectColumn1: string;
  levelData: [];
  OneConditionName: string;
  OneFilter: string;
  OneConditionValue: string;
  conditionData: [];
  folderId: string;
}
export interface queryFolderInput {
  folderId: string;
}
export interface deleteAutolinkInput {
  cmsAutolinkConditionId: string;
  cmsAutolinkLevel: string;
  misColumnId: string;
  misFolderId: string;
  misTypeId: string;
  cmsAutolinkId: string;
}
export interface EditAutolinkInput {
  cmsAutolinkConditionId: string;
  misColumnId: string;
  cmsAutolinkCondition: string;
  cmsAutolinkValue: string;
}
export interface GetAutoListPageableInput {
  folderId: string;
  typeId: string;
  folderName: string;
  pageState: PageState;
  sortModel: SortModel;
}
export interface AutoLinkInfo {
  cmsAutolinkConditionId: string;
  misColumnId: string;
  cmsAutolinkId: string;
  misFolderName: string;
  cmsFolderLevel: string;
  misColumnLabel: string;
  cmsAutolinkCondition: string;
  cmsAutolinkValue: string;
  cmsAutolinkConditionRel: string;
}
export interface mergeContentChumksInput {
  filename: string;
  identifier: string;
  totalSize: BigInteger;
  treeData: string;
  tableList: string;
  folderId: string;
  isAll: string;
  isAutoLink: string;
  fileSize: string;
}
export type GetAutoListPageResponse = DataResponse<{
  data: GetAutoListPageableInput[];
  total: number;
}>;
