import { DataResponse, PageState, PaginationInput, SortModel } from './common';
import { DicItem } from 'libs/common/src/lib/api';

export interface QueryFormDetail {
  misQfId: string;
  misQfName: string;
  misQfPublic?: string;
  tableLabel?: string;
  misQfTableId?: string;
  qfConditions?: QfConditions[];
  qfColumns?: QfColumns[];
  crossRef?: QueryFormDetailCrossRef[];
}

export interface QueryFormDetailCrossRef {
  // misQfId: string;
  misQfName: string;
  // misQfPublic?: string;
  // tableLabel?: string;
  misQfTableId: string;
  qfConditions?: QfConditions[];
  qfColumns?: QfColumns[];
  // crossRef?: QueryFormDetail[];
}

export interface QueryFormList {
  total: number;
  data: QueryFormDetail[];
}

export interface GetQueryFormPageableInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface DeleteQueryFormInput {
  id: string;
}

export interface GetQueryFormByIdInput {
  id: string;
}

export interface QueryTableDetail {
  key: string;
  value: string;
  allowSearch?: string;
}

export interface QueryColumnDetail {
  key: string;
  value: string;
}

export interface QfConditions {
  misQfId?: string;
  misQfc2ColumnId: string;
  misQfc2Condition: string;
  misQfc2Id?: string;
  misQfc2Value: string;
  misRelation?: string;
}

export interface QfColumns {
  misQfId: string;
  misQfcColumnId: string;
  misQfcId: string;
}

export interface SaveSearchFormInput {
  misQfId: string;
  misQfName: string;
  misQfTableId: string;
  misQfPublic: string;
  misQfGroupId: string;
  qfConditions: QfConditions[];
  qfColumns: QfColumns[];
  crossRef: QueryFormDetailCrossRef[];
}
export type SaveSearchFormResponse = DataResponse<{
  id: string;
}>;
