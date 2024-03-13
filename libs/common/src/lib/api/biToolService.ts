import { DataResponse, PageState, SortModel } from './common';

export interface BiToolView {
  misBiConfigId: string;
  misBiConfigName: string;
  misBiConfigTypeName: string;
  misBiConfigGraphicType: string;
  misBiConfigDate: string;
}

export interface BiToolList {
  data: BiToolView[];
  total: number;
}

export type GetBiToolResponse = DataResponse<BiToolList>;

export interface GetAllBiToolByPageInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface DelBiToolInput {
  misBiConfigId: string;
}
export interface EditBiToolInput {
  misBiConfigId: string;
  misBiConfigName: string;
  misBiConfigTypeId: string;
  misBiConfigType?: string;
  misTypeName: string;
  misBiConfigGraphicType: string;
  misBiConfigColumnHor: string;
  misBiConfigColumnVet: string;
  misBiConfigDefView: string;
}

export interface AddBiToolInput {
  misBiConfigName: string;
  misBiConfigTypeId: string;
  misBiConfigType?: string;
  misTypeName: string;
  misBiConfigGraphicType: string;
  misBiConfigColumnHor: string;
  misBiConfigColumnVet: string;
  misBiConfigDefView: string;
}

export interface BiToolInfo {
  misBiConfigId: string;
  misBiConfigName: string;
  misBiConfigTypeName: string;
  misBiConfigTypeId: string;
  misTypeName: string;
  misBiConfigGraphicType: string;
  misColumnId: string;
  misBiConfigColumnHor: string;
  misBiConfigColumnVet: string;
  misBiConfigDefView: string;
}

export interface BiToolInfo2 {
  misBiConfigId: string;
  misBiConfigName: string;
  misBiConfigTypeId: string;
  misBiConfigType?: string;
  misBiConfigGraphicType: string;
  misBiConfigColumnHor: string;
  misBiConfigColumnVet: string;
  misBiConfigDefView: string;
}

export interface GetBiToolInput {
  misBiConfigId: string;
}

export interface columnBiInput {
  misBiConfigTypeId: string;
}

export interface countColumnInput {
  tableId: string;
  columnId: string;
}
