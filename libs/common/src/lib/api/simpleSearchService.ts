import { PaginationInput, DataResponse, SortModel, PageState } from './common';
import { DicItem } from './propertyPage';
import { QfColumns, QfConditions, QueryFormDetailCrossRef } from './queryFormPage';

export interface GetDicData {
  key: string;
  value: string;
}

export type GetSimpleSearchDataInput = PaginationInput;

export interface SimpleSearchItem {
  id: string;
  itemName: string;
  // itemLabel: string;
  inputType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
  itemDictionary: string;
  itemLs: Array<GetDicData>;
  rowSize: number;
  colSize: number;
}

export interface SimpleSearchDetail {
  misSimpleSearchId: string;
  misSimpleSearchName: string;
  misSimpleSearchSql: string;
  items: SimpleSearchItem[];
}

export interface AddSimpleSearchInput {
  misSimpleSearchId: null;
  misSimpleSearchName: string;
  misSimpleSearchSql: string;
  items?: SimpleSearchItem[];
}

export interface EditSimpleSearchInput {
  misSimpleSearchId: string;
  misSimpleSearchName: string;
  misSimpleSearchSql: string;
  items?: SimpleSearchItem[];
}

export interface GetSimpleSearchByIdInput {
  id: string;
}

export interface GetSimpleSearchByIdResponse {
  status: string;
  message: string;
  data: SimpleSearchDetail;
}

export interface SimpleSearchRecordInput {
  folderId: string;
  simpleSearchId: string;
  data: string;
  sortModel: SortModel[];
  pageState: PageState;
}

export type GetSimpleSearchDicResponse = DataResponse<DicItem[]>;

export interface GetHadRecordInput {
  nodeId: string;
  workflowStatus?: string;
  sortModel: SortModel[];
  pageState: PageState;
}
