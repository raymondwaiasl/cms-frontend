import { DataResponse, PageState, PaginationInput, SortModel } from './common';

export interface PropertyPageDetail {
  misPropertyId: string;
  misPropertyName: string;
  tableLabel: string;
  misPropertyTableId?: string;
}

export type GetPropertyPageableInput = PaginationInput;

export type GetPropertyPageableResponse = DataResponse<{
  data: PropertyPageDetail[];
  total: number;
}>;

export interface GetPropertyDetailInput {
  id: string;
}

export interface PropertyConfigDetail {
  creationDate: number;
  creatorUserId: string;
  misIsLock: 'Y' | 'N';
  misLockedBy: string;
  misPropertyId: string;
  misPropertyName: string;
  misPropertyTableId: string;
  updatedDate: number;
  updatedUserId: string;
  misLockedLevel: string;
}
export interface IPropertyConfigDetails {
  name: string;
  misPropertySectionId: string;
  columns: Array<IPropertyConfigCols>;
}
export interface PropertyConfigDetails {
  misPropertyConfigDetailId: string;
  misPropertyId: string;
  misPropertyConfigDetailColumnId: string;
  creationDate: string;
  creatorUserId: string;
  updatedDate: string;
  updatedUserId: string;
  rowSize: number;
  colSize: number;
}
export interface IPropertyConfigCols {
  columnConfigDetail: any;
  misColumnLabel: string;
  misColumnInputType: string;
  id: string;
  misPropertyConfigDetailId: string;
  misPropertyId: string;
  misPropertyConfigDetailColumnId: string;
  creationDate: string;
  creatorUserId: string;
  updatedDate: string;
  updatedUserId: string;
  rowSize: number;
  colSize: number;
  misPropertySectionId: string;
  misIsLock: 'Y' | 'N';
  misLockedBy: string;
}

export type GetPropertyDetailResponse = DataResponse<{
  propertyConfig: PropertyConfigDetail;
  propertyConfigDetails: PropertyConfigDetails[];
}>;

export type GetPropertyDetailV2Response = DataResponse<{
  propertyConfig: PropertyConfigDetail;
  propertyConfigDetails: Array<IPropertyConfigDetails>;
  propertyTabConfs: PropertyTabs[];
}>;

export interface PropertyTabs {
  misPropertyId: string;
  misTypeId: string;
  misTypeLabel: string;
  misTypeName: string;
  misWorkspaceId: string;
}
export interface PropertyTabConfs {
  misPropertyTabConfId: string;
  misPropertyId: string;
  misTypeId: string;
  misWorkspaceId: string;
}
export interface DicItem {
  key: string;
  value: string;
}

export type GetTypeDicResponse = DataResponse<DicItem[]>;

export type GetColumnDicResponse = DataResponse<{
  data: DicItem[];
  total: number;
}>;

export interface GetColumnDicInput {
  id: string;
  allowSearch?: string;
}

export interface UpdatePropertyInput {
  propertyConfig: PropertyConfigDetail;
  propertyConfigDetails: PropertyConfigDetails[];
}
export interface UpdatePropertyV2Input {
  propertyConfig: PropertyConfigDetail;
  propertyConfigDetails: Array<IPropertyConfigDetails>;
  propertyTabConfs: PropertyTabConfs[];
}

export interface DeletePropertyInput {
  id: string;
}
export type GetPropertyConfigDetailResponse = DataResponse<{
  propertyConfig: PropertyConfigDetail;
  propertySectionName: propertySectionName;
  propertyConfigDetails: PropertyConfigDetails[];
}>;
export interface propertySectionName {
  sectionName: string;
}
