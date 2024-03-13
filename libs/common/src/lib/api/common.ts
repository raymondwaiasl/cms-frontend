export interface PageState {
  page: number;
  pageSize: number;
}
export interface SortModel {
  field: string;
  sort: string;
}
export type DataResponse<T> = {
  // status: string;
  code: number;
  // message: string;
  msg: string;
  data: T;
};

export interface PaginationInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface NewDataResponse<T> {
  status: number;
  // message: string;
  msg: string;
  data: T;
}

export interface WidgetDetail {
  misWidgetId: string;
  misWidgetName: string;
  misBasicWidget: string;
  misWidgetConfig: string;
  misWidgetType: 'N' | 'S' | 'D';
  misDefaultTable: string;
  misSimpleSearchId: string;
}
