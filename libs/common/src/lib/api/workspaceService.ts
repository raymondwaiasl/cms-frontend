import { DataResponse, PaginationInput, WidgetDetail } from './common';

export interface AddWorkspaceInput {
  misSortNum: string;
  misWorkspaceId: null;
  misWorkspaceName: string;
  misWorkspaceParentId: null;
  widgets?: Widget[];
}

export interface Widget {
  misWwAlias: string;
  misWwTitle: string;
  i?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface SelectWorkspaceWidgetByIdInput {
  id: string;
}

export interface SelectWorkspaceWidgetByIdInputResponse {
  status: string;
  message: string;
  data: WorkspaceDetail;
}
export interface OldSelectWorkspaceWidgetByIdInputResponse {
  status: string;
  message: string;
  data: OldWorkspaceDetail;
}

export interface WorkspaceDetail {
  misWorkspaceId: string;
  misWorkspaceName: string;
  misSortNum: number;
  misWorkspaceParentId: string;
  widgets: SelectWorkspaceWidgetWidget[];
  widgetDetail: { [key: string]: WidgetDetail };
}

export interface OldWorkspaceDetail {
  misWorkspaceId: string;
  misWorkspaceName: string;
  misSortNum: number;
  widgets: OldSelectWorkspaceWidgetWidget[];
}

export interface OldSelectWorkspaceWidgetWidget {
  misWwId: string;
  misWorkspaceId: string;
  misWwAlias: string;
  // layout: {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // };
}

export interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SelectWorkspaceWidgetWidget {
  misWwId: string;
  misWorkspaceId: string;
  misWidgetId: string;
  misBiConfigId?: string;
  misWwAlias: string;
  misWwTitle: string;
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  widgetDetail?: WidgetDetail;
}

export interface EditWorkspaceInput {
  misSortNum: number;
  misWorkspaceId: string;
  misWorkspaceName: string;
  misWorkspaceParentId: string;
  widgets?: Widget[];
}

export interface EditWorkspaceResponse {
  status: string;
  message: string;
  data: null;
}
export interface DeleteWorkspaceByIdInput {
  id: string;
}
export type DeleteWorkspaceByIdResponse = EditWorkspaceResponse;
export type GetWorkspaceListPageableInput = PaginationInput;
export type GetWorkspaceListPageableResponse = DataResponse<{
  data: WorkspaceDetail[];
  total: number;
}>;

export interface FindParentCandidateByIdData {
  id: string;
  to: string;
  name: string;
  sort: number;
  // children:Array<FindParentCandidateByIdData>;
}

export type FindParentCandidateByIdResponse = DataResponse<Array<FindParentCandidateByIdData>>;

export interface SetParentInput {
  id: string;
  parent: string;
}

export interface SetParentResponse {
  status: string;
  message: string;
  data: null;
}
