import { DataResponse, PageState, SortModel } from './common';
import { WorkspaceDetail } from './workspaceService';

export interface ContextDetail {
  misContextId: string;
  misContextName: string;
  misRoleName?: string;
  misContextRoleId?: string;
}

export interface ContextList {
  total: number;
  data: ContextDetail[];
}

export type GetContextListPageableResponse = DataResponse<ContextList>;

export interface GetContextListPageableInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface DeleteContextByIdInput {
  id: string;
}

export interface WorkspaceDetailInContext {
  misWorkspaceId: string;
  misWorkspaceName: string;
  misSortNum: number;
}

export interface RolesDetail {
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  misRoleId: string;
  misRoleName: string;
}

export interface GetContextDetailById {
  misContextId: string;
}

export type GetContextDetailByIdResponse = DataResponse<ContextDetailResponse>;

export interface ContextDetailResponse {
  misContext: ContextDetail;
  leftList: WorkspaceDetail[];
  rightList: WorkspaceDetail[];
}

export type GetRoleListResponse = DataResponse<RolesDetail[]>;

export type GetWorkSpaceListRepsponse = DataResponse<WorkspaceDetail[]>;

export interface AddContextInput {
  contextName: string;
  roleId: string;
  wsId: string;
}

export interface UpdateContextInput {
  contextId: string;
  contextName: string;
  roleId: string;
  wsId: string;
}

export interface GetContextByUserIdData {
  children: Array<GetContextByUserIdData>;
  to: string;
  name: string;
  sort: number;
}

export type GetContextByUserIdResponse = DataResponse<Array<GetContextByUserIdData>>;
