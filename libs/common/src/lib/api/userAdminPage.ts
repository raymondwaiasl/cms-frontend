import { DataResponse, PageState, SortModel, PaginationInput } from './common';

export interface UserDetail {
  misUserId: string;
  misUserName: string;
  misUserType: string;
  misEmail: string;
  misUserLoginId: string;
  misUserPassword: string;
  misUserLocation: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  misUserStatus?: string;
  delFlag?: string;
  loginDate?: string;
  remark?: string;
  avatar?: string;
  isAdmin?: string;
  currentGroup?: string;
  isLocked?: string;
  surnameEng?: string;
  givenNameEng?: string;
  otherNameEng?: string;
  district?: string;
  tel?: string;
  fax?: string;
  position?: string;
}

export interface GetUserAdminDataInput {
  misUserName: string;
  pageState: PageState;
  sortModel: SortModel;
}

export interface UserList {
  data: UserDetail[];
  total: number;
}

export interface DelUserInput {
  misUserId: string;
}

export interface ChangeAccountSettingInput {
  loginName: string;
  userName: string;
  emailAddress: string;
  groupName: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type GetAccountSettingResponse = DataResponse<ChangeAccountSettingInput>;

export interface SearchUserInput {
  misUserName?: string;
  surnameEng?: string;
  givenNameEng?: string;
  otherNameEng?: string;
  misEmail?: string;
  district?: string;
  tel?: string;
  fax?: string;
  misUserStatus?: string;
  hq?: string;
  pageable: PaginationInput;
}
