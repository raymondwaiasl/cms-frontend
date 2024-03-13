import { DataResponse, SortModel, PageState } from './common';
import { QfColumns, QfConditions, QueryFormDetailCrossRef } from './queryFormPage';
import { SelectWorkspaceWidgetWidget } from './workspaceService';

export interface GetTableData {
  key: string;
  value: string;
}
export type MisColumnInputType =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14';

export interface GetTableColumnDataV2 {
  name: string;
  misPropertySectionId: string;
  columns: Array<GetTableColumnData>;
}
export interface GetTableColumnData {
  misColumnId: string;
  misColumnName: string;
  misColumnLabel: string;
  misColumnInputType: MisColumnInputType;
  misColumnLength: string;
  misColumnType: string;
  misColumnWidth: number;
  misColumnDictionary: string;
  misColumnAllowEmpty: string;
  columnLs: Array<GetTableData>;
  rowSize: number;
  colSize: number;
  effect?: Array<EffectColumn>;
}

export interface EffectColumn {
  from: string;
  target: string;
}

export type GetTableNameResponse = DataResponse<GetTableData[]>;

export interface GetTableColumnInput {
  id: string;
}
export type GetTableColumnResponse = DataResponse<GetTableColumnData[]>;
export type GetTableColumnResponseV2 = DataResponse<GetTableColumnDataV2[]>;

export interface InsertTableDataInput {
  folder_id: string;
  tableId: string;
  [key: string]: string;
  checkData: string;
  BulkCreateData: string;
  simIds: string;
  tabValue: string;
  isDraft: string;
  saveDraft: string;
}
export interface GetTabsData {
  typeId: string;
  typeName: string;
  workspaceId: string;
  widgets: SelectWorkspaceWidgetWidget[];
  data: string;
}

export type GetTablesResponse = DataResponse<GetTabsData[]>;

export type InsertTableDataResponse = DataResponse<string>;

export interface GetFolderRecordListInput {
  folderId: string;
  typeId: string;
  sortModel: SortModel[];
  pageState: PageState;
}

export interface GetRecordListByRecIdsInput {
  typeId: string;
  recordIdList: string[];
}
export interface GetRecordHistoryByRecIdInput {
  typeId: string;
  recordId: string;
}

export interface GetRecordComparisonByRecIdInput {
  typeId: string;
  id1: string;
  id2: string;
}

export interface GetDefaultRecordListInput {
  folderId: string;
  typeId: string;
  widgetId: string;
  sortModel: SortModel[];
  pageState: PageState;
}

export type GetFolderRecordListResponse = DataResponse<GetFolderRecordListData>;

export interface GetFolderRecordListData {
  recordList: string[][];
  columnList: ColumnList[];
  total: number;
  TableList: string[];
  tableListData: { [key: string]: any }[];
}

export interface ColumnList {
  misTypeId: string;
  misColumnId?: string;
  misColumnName: string;
  misColumnLabel: string;
  misColumnType: string;
  misColumnWidth: number;
  misColumnLength: string;
  misColumnInputType: string;
  misColumnDictionary: string;
  misColumnAllowSearch: string;
}

export interface GetTabelAndRefInput {
  tableId: string;
  recordId: string;
  isDraft?: string;
  propertyId: string;
}

export interface GetPropertiesInput {
  tableId: string;
  recordId: string;
  propertyId?: string;
  isDraft?: string;
  
}
export interface GetProInput {
  tableId: string;
  recordId: string;
  propertyId: string;
}
export interface DeletePropertiesInput {
  id: string;
  typeId: string;
}
export type DeletePropertiesResponse = DataResponse<boolean>;

export interface GetPropertiesData {
  // labelList: LabelList[];
  refTableList: RefTableList[];
  columnDataList: ColumnDataList[];
  flag: boolean;
  isEdit: boolean;
  isDelete: boolean;
  // valueList: string[][];
  typeId: string;
  id: string;
}
export interface ColumnDataListV2 {
  name: string;
  misPropertySectionId: string;
  columns: Array<ColumnDataList>;
}
export interface ColumnDataListV5 {
  name: string;
  columns: Array<Array<ColumnDataList>>;
}
export interface ColumnDataListV3 {
  sectionColumnDTOS: ColumnDataListV2[];
  ColumnDTOList: ColumnDataListV5[];

}
export interface GetPropertiesDataV2 {
  // labelList: LabelList[];
  refTableList: RefTableList[];
  columnDataList: ColumnDataListV2[];
  flag: boolean;
  isEdit: boolean;
  isDelete: boolean;
  // valueList: string[][];
  typeId: string;
  id: string;
  tableLabel: string;
}

export interface SavePropertiesInput {
  typeId: string;
  id: string;
  data: DataField;
  simIds: string;
  tabValue: string;
}
export interface DataField {
  [key: string]: { input_type: string; value: string };
}

export type GetPropertiesResponse = DataResponse<GetPropertiesData>;
export type GetPropertiesResponseV2 = DataResponse<GetPropertiesDataV2>;
export type GetPropertiesResponseV3 = DataResponse<ColumnDataListV3>;
export type SavePropertiesResponse = DataResponse<boolean>;

// export interface LabelList {
//   columnName: string;
//   dictList: Array<GetTableData> | null;
// }

export type FolderIsSubscribeInput = {
  folderId: string;
};
export type FolderIsSubscribeResponse = DataResponse<boolean>;

export type UnsubscriptionInput = {
  objId: string;
};
export type UnsubscriptionResponse = DataResponse<boolean>;

export type SaveSubscriptionResponse = DataResponse<boolean>;

export interface SaveSubscriptionInput {
  buDate: string;
  checkedB: boolean;
  checkedD: boolean;
  checkedM: boolean;
  checkedN: boolean;
  id: string;
  repeat: string;
  typeId: string;
}

export interface ImportExcelDataInput {
  excelData: Array<any>;
  tableName: string;
  excelType: string;
  excelName: string;
  isOverwrite: string;
  decrypt: string;
  decryptPass: string;
  folderId: string;
  confirmPass: string;
}

export interface ColumnDataList {
  misColumnId: string;
  misColumnLabel: string;
  misColumnName: string;
  misColumnType: string;
  misColumnInputType:
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13';
  misColumnDictionary?: string;
  misColumnWidth: number;
  misColumnLength: string;
  misColumnAllowEmpty: string;
  dictList: any;
  value: any;
  row_size: number;
  col_size: number;
  effect?: Array<EffectColumn>;
}

export interface RefTableList {
  availableTable: boolean;
  misCrossRefId: string;
  misCrossRefParentTableID: string;
  misCrossRefParentTableLabel: string;
  misCrossRefChildTableID: string;
  misCrossRefChildTableLabel: string;
}
export interface GetRefPropertiesInput {
  tableId: string;
  recordId: string;
  misCrossRefId: string;
  isChildren: boolean;
}
export type GetRefPropertiesResponse = DataResponse<
  Omit<GetPropertiesData, 'refTableList'> & { hasChildrenTable: boolean }
>;

export interface SearchRecordsInput {
  typeId: string;
  qfColumns: QfColumns[];
  qfConditions: QfConditions[];
  folderId: string;
  crossRef?: QueryFormDetailCrossRef[];
  sortModel: SortModel[];
  pageState: PageState;
}

export interface GetSearchRecordRecordListData {
  recordList: string[][];
  columnList: ColumnList[];
  total: number;
  tableId: string;
}

export type SearchRecordsResponse = DataResponse<GetSearchRecordRecordListData>;

export type CalcColumnQueryResultInput = { misColumnId: string; param: { [key: string]: any } };

export type CalcColumnQueryResultResponse = DataResponse<{ result: string[] }>;

export interface UpdateTableDataInput {
  editData: { [key: string]: any };
  typeId: string;
}

export interface GetDelTableInput {
  tableId: string;
  recordId: string;
}
export interface GetIsPermTableInput {
  tableId: string;
  recordId: string;
  editTableRef: [];
}
export interface GetUpdateRecordInput {
  demo?: string;
  tableId: string;
  recordId: string;
  processContent: string;
  processDate: string;
}

export interface GetHadViewChangeData {
  recordList: string[][];
  columnList: ColumnList[];
  total: number;
  workflowId: string;
  workflowActivityId: string;
  userId: string;
  position: string;
  typeId: string;
  recordId: string;
}

export type GetHadViewChangeResponse = DataResponse<GetHadViewChangeData>;
