import { DataResponse, PaginationInput } from './common';

export interface TableData {
  misTypeId: string;
  misTypeLabel: string;
  misTypeName: string;
  misColumnList: TableColumn[];
}
export type TableDataInput = Omit<TableData, 'misColumnList'>;
export interface TableAndDrafData {
  misTypeId: string;
  misTypeLabel: string;
  misTypeName: string;
  draftTable: string;
  groupPerData: string;
  typeGpPermissionId: string;
}

export interface TableColumn {
  misColumnId: string;
  misTypeId: string;
  misColumnName: string;
  misColumnLabel: string;
  misColumnType: string;
  misColumnWidth: number;
  misColumnLength: string;
  misColumnInputType: string;
  misColumnDictionary: string;
  misColumnAllowSearch: string;
  misColumnAllowEmpty: string;
  misColumnSpan: number;
  misColumnComputeFrom?: string;
  misColumnComputeFormula?: TableColumnComputeFormula;
  misColumnComputeQuery?: string;
}

export interface TableColumnComputeFormula {
  misColumnId1: string;
  operator: string;
  misColumnId2: string;
}

export interface TypeData {
  misTypeId: string;
  misTypeLabel: string;
}
export interface typeItem {
  misTypeId: string;
  misTypeLabel: string;
  misTypeName: string;
}
export interface TypeList {
  data: TypeData[];
}
export interface queryColumnInput {
  id: string;
}
export type GetTypeLisResponse = DataResponse<TypeList>;

export type GetAllTypesInput = PaginationInput;

export type GetAllTypesResponse = DataResponse<{ data: TableData[]; total: number }>;

export type SelectTypeByIdResponse = DataResponse<TableData>;

export interface SelectTypeByIdInput {
  id: string;
}

export interface DeleteTypeInput {
  id: string;
}
export interface DeleteColumnInput {
  id: string;
}
export interface checkPermissionInput {
  typeId: string;
  recordId: string;
  demo: string;
}
export interface queryPermission {
  misGpId: string;
  misTypeId: string;
  access: string;
  directCreate: string;
  directEdit: string;
  directDelete: string;
  misGroupName: string;
}
export type DeleteTypeResponse = DataResponse<null>;
export type AddNewTypeAndDrafInput = TableAndDrafData;
export type AddNewTypeInput = TableDataInput;
export type AddNewColumnInput = TableColumn;
export type UpdateColumnInput = TableColumn;

export type UpdateTypeInput = TableDataInput;
export type AddNewTypeResponse = DataResponse<null>;
export type UpdateTypeResponse = DataResponse<null>;
export type UpdateColumnResponse = DataResponse<null>;
export type AddColumnResponse = DataResponse<null>;
export type DeleteColumnResponse = DataResponse<null>;

export type GetDicListResponse = DataResponse<{ key: string; value: string }[]>;
export type GetPermissionResponse = DataResponse<queryPermission[]>;
