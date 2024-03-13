export interface PageState {
  page: number;
  pageSize: number;
}
export interface SortModel {
  field: string;
  sort: string;
}
export type DataResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export interface PaginationInput {
  pageState: PageState;
  sortModel: SortModel;
}
