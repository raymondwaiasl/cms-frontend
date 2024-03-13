import { PaginationInput, DataResponse } from './common';

export interface WidgetItem {
  misWidgetId?: string;
  misWidgetName: string;
  misBasicWidget: string;
  misWidgetConfig: string;
  misWidgetType: string;
  misDefaultTable?: string;
  misSimpleSearchId?: string;
  misQuerySql?: string;
  list?: {
    includeList: Array<any>;
    excludeList: Array<any>;
  };
  tableIds: Array<any>;
}

export type GetWidgetDataInput = PaginationInput;

export type GetWidgetDataResponse = DataResponse<{ data: WidgetItem[]; total: number }>;

export interface GetWidgetInput {
  id: string;
}
