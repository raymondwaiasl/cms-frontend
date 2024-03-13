import { DataResponse, PaginationInput } from './common';
import { UserDetail } from './userAdminPage';

// FindAllOrgChart
export type FindAllOrgChartResponse = DataResponse<childrenData[]>;
export interface childrenData {
  parentId: string;
  id: string;
  level: string;
  name: string;
  children?: childrenData[];
}
// GetMemberData
export interface GetMemberDataInput extends PaginationInput {
  level: string;
  nodeId: string;
}

export type GetMemberDataResponse = DataResponse<GetMemberDataResponseData>;

export interface GetMemberDataResponseData {
  data: Member[];
  total: number;
}

export interface Member {
  id: string;
  name: string;
  type?: string;
  isAdmin?: string;
  defaultFolderId?: string;
  misRoleName?: string;
  misRoleId?: string;
}
// GetUserInfo
export interface GetUserInfoInput {
  level: string;
  nodeId: string;
}
export type GetUserInfoResponse = DataResponse<UserInfoData[]>;

export interface UserInfoData {
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  misUserId: string;
  misUserName: string;
  misUserLoginId: string;
  position:string;
  misUserType: any;
  misEmail: string;
  misUserPassword: string;
  misUserStatus: any;
  delFlag: any;
  misUserLocation: string;
  loginDate: any;
  remark: any;
  avatar: any;
}

export type GetMemberInfoByGroupInput = { id: string };

export type UpdateMemberByRoleInput = {
  memberIds: string;
  roleId: string;
  roleName: string;
};
export type UpdateMemberByRoleResponse = DataResponse<string>;

export type UpdateMemberByGroupInput = {
  groupId: string;
  groupName: string;
  isAdmin: string;
  defaultFolderId: string;
  memberIds: string;
};

export type UpdateMemberByGroupResponse = DataResponse<string>;

export interface GetGroupInfoByIdInput {
  roleId: string;
}

export interface GetGroupInfoByIdData {
  id: string;
  name: string;
}
export interface GetGroupInfoByGroupData {
  id: string;
  name: string;
  type: string;
}

export type GetGroupInfoByIdResponse = DataResponse<GetGroupInfoByIdData[]>;

export type GetMemberInfoByRoleInput = GetGroupInfoByIdInput;

export type GetMemberInfoByRoleResponse = DataResponse<childrenData[]>;

export type GetGroupInfoByGroupResponse = GetMemberInfoByRoleResponse;

export type GetMemberInfoByGroupResponse = DataResponse<MemberInfoByGroup>;

export interface MemberInfoByGroup {
  includeUsers: Member[];
  excludeUsers: Member[];
}

export type GetUserInfoByIdResponse = GetGroupInfoByIdResponse;

export interface DelGroupUserInput {
  id: string;
  nodeId: string;
  type: string;
}
export type DelGroupUserResponse = DataResponse<string>;

export interface DelRoleInput {
  misRoleId: string;
}
export type DelRoleResponse = DataResponse<string>;

export type InsertMemberByGroupInput = {
  groupName: string;
  isAdmin: string;
  defaultFolderId: string;
  level: string;
  nodeId: string;
  memberIds: string;
};
export type InsertMemberByRoleInput = {
  roleName: string;
  memberIds: string;
};

export type GetMyProfileByUserIdResponse = DataResponse<UserDetail>;

export type GetWorkflowTreeResponse = DataResponse<WorkflowTreeItem[]>;
export interface WorkflowTreeItem {
  parentId: string;
  id: string;
  name: string;
  count: string;
  level: string;
  children?: WorkflowTreeItem[];
}
