import type {
  AddColumnResponse,
  AddContextInput,
  AddNewColumnInput,
  AddNewTypeInput,
  AddNewTypeResponse,
  AddSysConfigInput,
  AddWorkspaceInput,
  DelDictionaryDetailInput,
  DelDictionaryInput,
  DeleteColumnInput,
  DeleteColumnResponse,
  DeleteContextByIdInput,
  DeleteFolderInput,
  DeleteFolderResponse,
  DeleteOrgInput,
  DeletePropertiesInput,
  DeletePropertiesResponse,
  DeletePropertyInput,
  DeleteQueryFormInput,
  DeleteSysConfigInput,
  DeleteTypeInput,
  DeleteTypeResponse,
  DeleteWorkspaceByIdInput,
  DeleteWorkspaceByIdResponse,
  DelGroupUserInput,
  DelGroupUserResponse,
  DelPermissionDataInput,
  DelPermissionDataResponse,
  DelRoleInput,
  DelRoleResponse,
  DelSubscriptionMsg,
  DelUserInput,
  DownloadReportInput,
  EditWorkspaceInput,
  EditWorkspaceResponse,
  FindAllOrgChartResponse,
  FolderIsSubscribeInput,
  FolderIsSubscribeResponse,
  GenerateInventoryReportInput,
  GenerateStatisticReportInput,
  UpdatePropertyV2Input,
  GetAllTypesInput,
  GetAllTypesResponse,
  GetAuditPageInput,
  GetColumnDicInput,
  GetContextByUserIdResponse,
  GetContextDetailById,
  GetContextDetailByIdResponse,
  GetContextListPageableInput,
  GetContextListPageableResponse,
  GetDicDetailDataInput,
  GetDicListResponse,
  GetDictionaryInput,
  GetFolderListResponse,
  GetFolderRecordListInput,
  GetFolderRecordListResponse,
  GetGroupInfoByGroupResponse,
  GetGroupInfoByIdInput,
  GetGroupInfoByIdResponse,
  GetMemberDataInput,
  GetMemberDataResponse,
  GetMemberInfoByGroupInput,
  GetMemberInfoByGroupResponse,
  GetMemberInfoByRoleInput,
  GetMemberInfoByRoleResponse,
  GetPropertiesInput,
  GetPropertiesResponseV2, // GetPropertiesDataResponse,
  GetPropertyDetailInput,
  GetTableColumnResponseV2,
  GetPropertyPageableInput,
  GetPropertyPageableResponse,
  GetQueryFormByIdInput,
  GetQueryFormPageableInput,
  GetReportsInput,
  GetRoleListResponse,
  GetSubscriptionMsg,
  GetSubscriptionMsgResponse,
  GetTableColumnInput,
  GetTableColumnResponse,
  GetTableNameResponse,
  GetTypeDicResponse,
  GetUserAdminDataInput,
  GetUserInfoByIdResponse,
  GetUserInfoInput,
  GetUserInfoResponse,
  GetWorkspaceListPageableInput,
  GetWorkspaceListPageableResponse,
  GetWorkSpaceListRepsponse,
  InsertMemberByGroupInput,
  InsertMemberByRoleInput,
  InsertTableDataInput,
  InsertTableDataResponse,
  loginInput,
  LoginInputResponse,
  QueryFolderPermissionInput,
  QueryFolderPermissionResponse,
  QueryFormDetail,
  QueryGroupDataInput,
  QueryGroupDataResponse,
  QueryRecordPermissionInput,
  GetRenditionInput,
  QueryRenditionDataResponse,
  DeleteRenditionInput,
  DeleteRenditionResponse,
  AddStorageInput,
  DeleteStorageByIdInput,
  DeleteStorageByIdResponse,
  GetStorageDetailById,
  GetStorageDetailByIdResponse,
  GetStorageListPageableInput,
  GetStorageListPageableResponse,
  UpdateStorageInput,
  queryColumnInput,
  deleteAutolinkInput,
  GetAutoListPageableInput,
  EditAutolinkInput,
  deleteVersionInput,
  GetVersionListPageableInput,
  downloadInput,
  autoLinkInput,
  uploadVersionInput,
  isUploadInput,
  mergeChumksInput,
  SaveDictionaryDetailInput,
  SaveDictionaryInput,
  SaveFolderInput,
  SaveFolderResponse,
  SaveOrgNameInput,
  SavePermissionDataInput,
  SavePermissionDataResponse,
  SavePropertiesInput,
  SavePropertiesResponse,
  SaveSearchFormInput,
  SaveSearchFormResponse,
  SaveSubscriptionInput,
  SaveSubscriptionResponse,
  SelectTypeByIdInput,
  SelectTypeByIdResponse,
  SelectWorkspaceWidgetByIdInput,
  SelectWorkspaceWidgetByIdInputResponse,
  UnsubscriptionInput,
  UnsubscriptionResponse,
  UpdateColumnInput,
  UpdateColumnResponse,
  UpdateContextInput,
  UpdateFolderInput,
  UpdateFolderResponse,
  UpdateMemberByGroupInput,
  UpdateMemberByGroupResponse,
  UpdateMemberByRoleInput,
  UpdateMemberByRoleResponse,
  UpdatePropertyInput,
  UpdateSubscriptionMsg,
  UpdateTypeInput,
  UpdateTypeResponse,
  UserDetail,
  GetAllTypeRefInput,
  UpdateTypeRefInput,
  DeleteTypeRefInput,
  AddTypeRefInput,
  GetAllTypeRefResponse,
  GetRefPropertiesInput,
  GetRefPropertiesResponse,
  SearchRecordsInput,
  SearchRecordsResponse,
  mergeContentChumksInput,
  GetAllBiToolByPageInput,
  DelBiToolInput,
  AddBiToolInput,
  GetBiToolInput,
  EditBiToolInput,
  columnBiInput,
  countColumnInput,
  downloadChunkInput,
  FindParentCandidateByIdResponse,
  SetParentInput,
  SetParentResponse,
  AddProcessInput,
  DeleteProcessByIdInput,
  DeleteProcessByIdResponse,
  GetAllProcessInput,
  GetAllProcessResponse,
  GetProcessDetailById,
  GetProcessDetailByIdResponse,
  UpdateProcessInput,
  GetWorkflowResponse,
  GetAllActivitiesInput,
  GetAllActivitiesResponse,
  AcquireTaskInput,
  ApproveTaskInput,
  DelegateTaskInput,
  GetMyInboxList,
  RejectTaskInput,
  WithdrawWorkflowInput,
  IdInput,
  GetCommentListResponse,
  SaveTaskCommentInput,
  GetAttachmentList,
  TerminateWorkflowInput,
  GetRecordListByRecIdsInput,
  GetCrossRefByIdResponse,
  GetCrossRefByIdInput,
  GetDefaultFolderResponse,
  FindSysConfigByKeyInput,
  FindSysConfigByKeyResponse,
  UpdateDictionaryInput,
  GetWidgetDataInput,
  WidgetItem,
  GetWidgetInput,
  GetAccountSettingResponse,
  ChangeAccountSettingInput,
  ChangePasswordInput,
  SavePropertyColumnPermissionInput,
  GetPropertyColumnPermissionInput,
  CalcColumnQueryResultInput,
  CalcColumnQueryResultResponse,
  GetDefaultRecordListInput,
  AddSimpleSearchInput,
  GetSimpleSearchByIdInput,
  GetSimpleSearchByIdResponse,
  EditSimpleSearchInput,
  SimpleSearchRecordInput,
  GetSimpleSearchDataInput,
  GetSimpleSearchDicResponse,
  GetRecordHistoryByRecIdInput,
  GetRecordComparisonByRecIdInput,
  forogtPwdInput,
  resetInput,
  GetGroupDataInput,
  GetGroupDataResponse,
  GetMyProfileByUserIdResponse,
  GetPasswordPolicyResponse,
  SearchUserInput,
  UpdateTableDataInput,
  AddNewTypeAndDrafInput,
  QueryAllGroupDataInput,
  GetAllGroupResponse,
  GetDelTableInput,
  GetPropertyConfigDetailResponse,
  GetPropertyDetailV2Response,
  GetIsPermTableInput,
  GetUpdateRecordInput,
  GetWorkflowTreeResponse,
  GetHadRecordInput,
  AddRelationInput,
  DeleteRelationInput,
  TypeIdInput,
  GetTablesResponse,
  checkPermissionInput,
  GetHadViewChangeResponse,
  GetPermissionResponse,
  typeAndRecInput,
  GetPropertiesResponseV3,
  GetProInput,
  GetTabelAndRefInput,
  AddWelcomeInput,
} from './';
import './myInboxList';
import API_ROUTES from './route';
import { AxiosInstance } from 'axios';
// import { ResInterceptor } from '../context';
import type { AxiosProgressEvent, AxiosResponse } from 'axios';

export default class Client {
  #API: AxiosInstance;
  onErrorCallback: (error: string) => void;
  // onSuccessCallback:()=>void
  interceptor: number;
  constructor(API: AxiosInstance, onErrorCallback: (error: string) => void) {
    this.#API = API;
    this.onErrorCallback = onErrorCallback;
    // this.onSuccessCallback=onSuccessCallback
    this.interceptor = this.#API.interceptors.response.use(
      (response: AxiosResponse) => {
        if (!(response.data instanceof Blob) && response.data.code !== 200) {
          // toast.error(response.data.msg);
          onErrorCallback(response.data.msg);
          return Promise.reject(response.data);
        }

        console.log(response);
        return response.data;
      },
      (error) => {
        console.log(error);
        if (error.code === 'ERR_NETWORK') {
          //  onSuccessCallback()
          return Promise.reject(error);
        }
        console.log(error.response.status);
        if (error.response.status === 403) {
          window.location.pathname = '/login';
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
        onErrorCallback(error.response.data.msg);
        return Promise.reject(error);
      }
    );
  }
  loginService = {
    login: (data: loginInput) =>
      this.#API.post<any, LoginInputResponse>(API_ROUTES.loginService.LOGIN, data),
    forgotPwd: (data: forogtPwdInput) =>
      this.#API.post<any, LoginInputResponse>(API_ROUTES.loginService.FORGOT, data),
    reset: (data: resetInput) =>
      this.#API.post<any, LoginInputResponse>(API_ROUTES.loginService.RESET, data),
    getPasswordPolicy: () =>
      this.#API.get<any, GetPasswordPolicyResponse>(API_ROUTES.loginService.GET_PASSWORD_POLICY),
  };
  context = {
    getContextListPageable: (data: GetContextListPageableInput) =>
      this.#API.post<any, GetContextListPageableResponse>(
        API_ROUTES.context.FIND_CONTEXT_LIST,
        data
      ),
    getWorkSpaceList: () =>
      this.#API.post<any, GetWorkSpaceListRepsponse>(API_ROUTES.context.FIND_WORKSPACE_LIST, {}),
    getRoleList: () =>
      this.#API.post<any, GetRoleListResponse>(API_ROUTES.context.FIND_ROLE_LIST, {}),
    addContext: (data: AddContextInput) => this.#API.post(API_ROUTES.context.ADD_CONTEXT, data),
    updateContext: (data: UpdateContextInput) =>
      this.#API.post(API_ROUTES.context.UPDATE_CONTEXT, data),
    deleteContextById: (data: DeleteContextByIdInput) =>
      this.#API.post<any, DeleteWorkspaceByIdResponse>(API_ROUTES.context.DELETE_CONTEXT, data),
    getContextDetail: (data: GetContextDetailById) =>
      this.#API.post<any, GetContextDetailByIdResponse>(API_ROUTES.context.DETAIL_CONTEXT, data),
  };
  userService = {
    findOrgChart: () =>
      this.#API.get<any, FindAllOrgChartResponse>(API_ROUTES.userService.FIND_ORG_CHART),
    getMember: (data: GetMemberDataInput) =>
      this.#API.post<any, GetMemberDataResponse>(API_ROUTES.userService.GET_MEMBER, data),
    getUserInfo: (data: GetUserInfoInput) =>
      this.#API.post<any, GetUserInfoResponse>(API_ROUTES.userService.GET_USER_INFO, data),
    getGroupInfoById: (data: GetGroupInfoByIdInput) =>
      this.#API.post<any, GetGroupInfoByIdResponse>(
        API_ROUTES.userService.GET_GROUP_INFO_BY_ID,
        data
      ),
    getMemberInfoByRole: (data: GetMemberInfoByRoleInput) =>
      this.#API.post<any, GetMemberInfoByRoleResponse>(
        API_ROUTES.userService.GET_MEMBER_INFO_BY_BY_ROLE,
        data
      ),
    getMemberInfoByGroup: (data: GetMemberInfoByGroupInput) =>
      this.#API.post<any, GetMemberInfoByGroupResponse>(
        API_ROUTES.userService.GET_MEMBER_INFO_BY_GROUP,
        data
      ),
    getUserInfoById: (data: GetMemberInfoByGroupInput) =>
      this.#API.post<any, GetUserInfoByIdResponse>(
        API_ROUTES.userService.GET_USER_INFO_BY_ID,
        data
      ),
    getUserInfoByGroup: () =>
      this.#API.post<any, GetGroupInfoByGroupResponse>(
        API_ROUTES.userService.GET_USER_INFO_BY_GROUP,
        {}
      ),
    delRole: (data: DelRoleInput) =>
      this.#API.post<any, DelRoleResponse>(API_ROUTES.userService.DEL_ROLE, data),
    delGroupUser: (data: DelGroupUserInput) =>
      this.#API.post<any, DelGroupUserResponse>(API_ROUTES.userService.DEL_GROUP_USER, data),
    getContextByUserId: () =>
      this.#API.get<any, GetContextByUserIdResponse>(API_ROUTES.workspace.GET_CONTEXT_BY_USER_ID),
    updateMemberByRole: (data: UpdateMemberByRoleInput) =>
      this.#API.post<any, UpdateMemberByRoleResponse>(
        API_ROUTES.userService.UPDATE_MEMBER_BY_ROLE,
        data
      ),
    updateMemberByGroup: (data: UpdateMemberByGroupInput) =>
      this.#API.post<any, UpdateMemberByGroupResponse>(
        API_ROUTES.userService.UPDATE_MEMBER_BY_GROUP,
        data
      ),
    queryGroupData: (data: QueryGroupDataInput) =>
      this.#API.post<any, QueryGroupDataResponse>(API_ROUTES.userService.QUERY_GROUP_DATA, data),
    getGroupsByUserId: (data: GetGroupDataInput) =>
      this.#API.post<any, GetGroupDataResponse>(API_ROUTES.userService.GET_GROUP_DATA, data),
    getMyProfileByUserId: (data: GetMemberInfoByGroupInput) =>
      this.#API.post<any, GetMyProfileByUserIdResponse>(API_ROUTES.userService.GET_MYPROFILE, data),
    queryAllGroupData: (data: QueryAllGroupDataInput) =>
      this.#API.post<any, GetAllGroupResponse>(API_ROUTES.userService.QUERY_ALL_GROUP_DATA, data),
    getWorkflowTree: () =>
      this.#API.get<any, GetWorkflowTreeResponse>(API_ROUTES.userService.GET_WORKFLOW_TREE),
  };

  userPermission = {
    queryFolderPermission: (data: QueryFolderPermissionInput) =>
      this.#API.post<any, QueryFolderPermissionResponse>(
        API_ROUTES.userPermission.QUERY_FOLDER_PERMISSION,
        data
      ),

    queryRecordPermission: (data: QueryRecordPermissionInput) =>
      this.#API.post<any, QueryFolderPermissionResponse>(
        API_ROUTES.userPermission.QUERY_RECORD_PERMISSION,
        data
      ),
    savePermissionData: (data: SavePermissionDataInput) =>
      this.#API.post<any, SavePermissionDataResponse>(
        API_ROUTES.userPermission.SAVE_PERMISSION_DATA,
        data
      ),
    deletePermissionData: (data: DelPermissionDataInput) =>
      this.#API.post<any, DelPermissionDataResponse>(
        API_ROUTES.userPermission.DEL_PERMISSION,
        data
      ),
    insertMemberByGroup: (data: InsertMemberByGroupInput) =>
      this.#API.post<any, SavePermissionDataResponse>(
        API_ROUTES.userService.INSERT_MEMBER_BY_GROUP,
        data
      ),
    insertMemberByRole: (data: InsertMemberByRoleInput) =>
      this.#API.post<any, SavePermissionDataResponse>(
        API_ROUTES.userService.INSERT_MEMBER_BY_ROLE,
        data
      ),
    getGroupDefaultFolderByGroupId: () =>
      this.#API.post(API_ROUTES.userPermission.GET_GROUP_DEFAULT_FOLDER),
  };

  userAdmin = {
    delUser: (data: DelUserInput) => this.#API.post(API_ROUTES.userAdmin.DEL_USER, data),
    getAllUser: (data: GetUserAdminDataInput) =>
      this.#API.post(API_ROUTES.userAdmin.QUERY_USER_ALL, data),
    saveUser: (data: UserDetail) => this.#API.post(API_ROUTES.userAdmin.EDIT_USER_DATA, data),
    getAccountSetting: () =>
      this.#API.post<any, GetAccountSettingResponse>(API_ROUTES.userAdmin.GET_ACCOUNT_SETTING, {}),
    changeAccountSetting: (data: ChangeAccountSettingInput) =>
      this.#API.post(API_ROUTES.userAdmin.CHANGE_ACCOUNT_SETTING, data),
    changePassword: (data: ChangePasswordInput) =>
      this.#API.post(API_ROUTES.userAdmin.CHANGE_PASSWORD, data),
    searchUser: (data: SearchUserInput) => this.#API.post(API_ROUTES.userAdmin.SEARCH_USER, data),
  };
  workspace = {
    addWorkspace: (data: AddWorkspaceInput) =>
      this.#API.post(API_ROUTES.workspace.ADD_WORKSPACE, data),
    editWorkspace: (data: EditWorkspaceInput) =>
      this.#API.post<any, EditWorkspaceResponse>(API_ROUTES.workspace.EDIT_WORKSPACE, data),
    getWorkspaceListPageable: (data: GetWorkspaceListPageableInput) =>
      this.#API.post<any, GetWorkspaceListPageableResponse>(
        API_ROUTES.workspace.GET_WORKSPACE_LIST_PAGABLE,
        data
      ),
    deleteWorkspaceById: (data: DeleteWorkspaceByIdInput) =>
      this.#API.post<any, DeleteWorkspaceByIdResponse>(
        API_ROUTES.workspace.DELETE_WORKSPACE_BY_ID,
        data
      ),
    getFolderList: () =>
      this.#API.post<any, GetFolderListResponse>(API_ROUTES.folderService.GET_FOLDER_LIST, {}),
    selectWorkspaceWidgetById: (data: SelectWorkspaceWidgetByIdInput) =>
      this.#API.post<any, SelectWorkspaceWidgetByIdInputResponse>(
        API_ROUTES.workspace.SELECT_WORKSPACE_WIDGET_BY_ID,
        data
      ),
    findParentCandidateById: (data: string) =>
      this.#API.post<any, FindParentCandidateByIdResponse>(
        API_ROUTES.workspace.FIND_PARENT_CANDIDATE_BY_ID,
        { id: data }
      ),
    setParent: (data: SetParentInput) =>
      this.#API.post<any, SetParentResponse>(API_ROUTES.workspace.SET_PARENT, data),
    getWorkspaceList: () => this.#API.post(API_ROUTES.workspace.FIND_ALL_WORKSPACE_LIST, {}),
  };
  folderService = {
    saveFolder: (data: SaveFolderInput) =>
      this.#API.post<any, SaveFolderResponse>(API_ROUTES.folderService.SAVE_FOLDER, data),
    updateFolder: (data: UpdateFolderInput) =>
      this.#API.post<any, UpdateFolderResponse>(API_ROUTES.folderService.UPDATE_FOLDER, data),
    deleteFolder: (data: DeleteFolderInput) =>
      this.#API.post<any, DeleteFolderResponse>(API_ROUTES.folderService.DELETE_FOLDER, data),
    getFolderList: () =>
      this.#API.post<any, GetFolderListResponse>(API_ROUTES.folderService.GET_FOLDER_LIST, {}),
    getDefaultFolder: () =>
      this.#API.post<any, GetDefaultFolderResponse>(
        API_ROUTES.folderService.GET_DEFAULT_FOLDER,
        {}
      ),
  };
  queryForm = {
    getQueryFormPageable: (data: GetQueryFormPageableInput) =>
      this.#API.post(API_ROUTES.queryForm.GET_QUERY_LIST, data),
    getQueryFormList: (data: GetQueryFormPageableInput) =>
      this.#API.post('/mySearch/getMySearchListPageable', data),
    getTypeDic: () => this.#API.get<any, GetTypeDicResponse>(API_ROUTES.queryForm.GET_TYPE_DIC),
    editQueryForm: (data: QueryFormDetail) =>
      this.#API.post(API_ROUTES.queryForm.EDIT_QUERY_FORM, data),
    addQueryForm: (data: QueryFormDetail) =>
      this.#API.post(API_ROUTES.queryForm.ADD_QUERY_FORM, data),
    getQueryFormById: (data: GetQueryFormByIdInput) =>
      this.#API.post<QueryFormDetail>(API_ROUTES.queryForm.GET_QUERY_FORM_BY_ID, data),
    deleteQueryFormById: (data: DeleteQueryFormInput) =>
      this.#API.post(API_ROUTES.queryForm.DELETE_QUERY_FORM, data),
    getColumnDic: (data: GetColumnDicInput) =>
      this.#API.post(API_ROUTES.queryForm.GET_COLUMN_DIC, data),
    getQueryColumnDic: (data: GetColumnDicInput) =>
      this.#API.post(API_ROUTES.queryForm.GET_QUERY_COLUMN_DIC, data),
    saveSearchForm: (data: SaveSearchFormInput) =>
      this.#API.post<any, SaveSearchFormResponse>(API_ROUTES.queryForm.SAVE_SEARCH_FORM, data),
  };
  recordManage = {
    getTableName: () =>
      this.#API.post<any, GetTableNameResponse>(API_ROUTES.recordManage.GET_TABLE_NAME, null),
    getTableColumn: (data: GetTableColumnInput) =>
      this.#API.post<any, GetTableColumnResponseV2>(API_ROUTES.recordManage.GET_TABLE_COLUMN, data),
    getTableColumnByPropertyId: (data: GetTableColumnInput) =>
      this.#API.post<any, GetTableColumnResponseV2>(API_ROUTES.recordManage.GET_TABLE_COLUMN_BY_PROPERTY_ID, data),
    insertTableData: (data: InsertTableDataInput) =>
      this.#API.post<any, InsertTableDataResponse>(API_ROUTES.recordManage.INSERT_TABLE_DATA, data),
    calcColumnQueryResult: (data: CalcColumnQueryResultInput) =>
      this.#API.post<any, CalcColumnQueryResultResponse>(
        API_ROUTES.recordManage.CALC_COLUMN_QUERY_RESULT,
        data
      ),
    updateTableData: (data: UpdateTableDataInput) =>
      this.#API.post<any, InsertTableDataResponse>(API_ROUTES.recordManage.UPDATE_TABLE_DATA, data),
    deleteTableData: (data: GetDelTableInput) =>
      this.#API.post<any, InsertTableDataResponse>(API_ROUTES.recordManage.DELETE_TABLE_DATA, data),
    isHasPermission: (data: GetIsPermTableInput) =>
      this.#API.post<any, InsertTableDataResponse>(API_ROUTES.recordManage.IS_HAS_PERMISSION, data),
    exportPDFContent: (data: GetRecordHistoryByRecIdInput) =>
      this.#API.post<any, Blob>(API_ROUTES.recordManage.EXPORT_PDF_CONTENT, data, {
        responseType: 'blob',
      }),
    printTableData: (data: GetDelTableInput) =>
      this.#API.post<any, InsertTableDataResponse>(API_ROUTES.recordManage.PRINT_TABLE_DATA, data),
    getRelationData: (data: GetDelTableInput) =>
      this.#API.post(API_ROUTES.recordManage.GET_RELATION_DATA, data),
    updateTypeRecord: (data: GetUpdateRecordInput) =>
      this.#API.post<any, InsertTableDataResponse>(
        API_ROUTES.recordManage.UPDATE_TYPE_RECORD,
        data
      ),
    getTabsConf: (data: GetTableColumnInput) =>
      this.#API.post<any, GetTablesResponse>(API_ROUTES.recordManage.GET_TABS_CONF, data),
    getTabsData: (data: GetProInput) =>
      this.#API.post<any, GetTablesResponse>(API_ROUTES.recordManage.GET_TABS_DATA, data),
    getRecordIdByTypeId: (data: GetTableColumnInput) =>
      this.#API.post(API_ROUTES.recordManage.GET_RECORDID_BY_TYPEID, data),
    getPropertyByTypeId: (data: GetTableColumnInput) =>
      this.#API.post(API_ROUTES.recordManage.GET_PROPERTY_BY_TYPEID, data),
    getColumnByPropertyId: (data: GetTableColumnInput) =>
      this.#API.post(API_ROUTES.recordManage.GET_PROPERTY_BY_TYPEID, data),
  };

  recordService = {
    getFolderRecordList: (data: GetFolderRecordListInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_FOLDER_RECORD_LIST,
        data
      ),
    getRecordListByRecIds: (data: GetRecordListByRecIdsInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_LIST,
        data
      ),
    getDefaultRecordList: (data: GetDefaultRecordListInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_DEFAULT_RECORD_LIST,
        data
      ),
    getQueryRecordList: (data: GetDefaultRecordListInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_QUERY_RECORD_LIST,
        data
      ),
    getProperties: (data: GetProInput) =>
      this.#API.post<any, GetPropertiesResponseV2>(API_ROUTES.recordService.GET_PROPERTIES, data),
    getRefProperties: (data: GetRefPropertiesInput) =>
      this.#API.post<any, GetRefPropertiesResponse>(
        API_ROUTES.recordService.GET_REF_PROPERTIES,
        data
      ),
    deleteProperties: (data: DeletePropertiesInput) =>
      this.#API.post<any, DeletePropertiesResponse>(API_ROUTES.recordService.DEL_PROPERTIES, data),
    saveProperties: (data: SavePropertiesInput) =>
      this.#API.post<any, SavePropertiesResponse>(API_ROUTES.recordService.SAVE_PROPERTIES, data),
    searchRecord: (data: SearchRecordsInput) =>
      this.#API.post<any, SearchRecordsResponse>(API_ROUTES.recordService.SEARCH_RECORD, data),
    getRecordHistoryByRecId: (data: GetRecordHistoryByRecIdInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_HISTORY,
        data
      ),
    getRecordHistoryLogByRecId: (data: GetRecordHistoryByRecIdInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_HISTORY_LOG,
        data
      ),
    getRecordComparisonByRecId: (data: GetRecordComparisonByRecIdInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_COMPARISON,
        data
      ),
    getRecordAuditDetailByRecId: (data: GetRecordHistoryByRecIdInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_AUDIT_DETAIL,
        data
      ),
    getRecordEditHistoryByRecId: (data: GetRecordHistoryByRecIdInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_RECORD_EDIT_LIST,
        data
      ),
    getTabRecordByRecIds: (data: GetRecordListByRecIdsInput) =>
      this.#API.post<any, GetFolderRecordListResponse>(
        API_ROUTES.recordService.GET_TAB_RECORD_LIST_BY_RECID,
        data
      ),
    getTableAndRefTab: (data: GetTabelAndRefInput) =>
      this.#API.post<any, GetPropertiesResponseV3>(API_ROUTES.recordService.GET_TABLE_AND_REF_TAB, data),
    getDraftProperties: (data: GetPropertiesInput) =>
      this.#API.post<any, GetPropertiesResponseV2>(API_ROUTES.recordService.GET_DRAFT_PROPERTIES, data),
    deleteDraftProperties: (data: GetPropertiesInput) =>
      this.#API.post<any, DeletePropertiesResponse>(API_ROUTES.recordService.DEL_DRAFT_PROPERTIES, data),
    saveDraftProperties: (data: SavePropertiesInput) =>
      this.#API.post<any, SavePropertiesResponse>(API_ROUTES.recordService.SAVE_DRAFT_PROPERTIES, data),
  };
  subscription = {
    folderIsSubscribe: (data: FolderIsSubscribeInput) =>
      this.#API.post<any, FolderIsSubscribeResponse>(
        API_ROUTES.subscription.FOLDER_IS_SUBSCRIBE,
        data
      ),
    unsubscribe: (data: UnsubscriptionInput) =>
      this.#API.post<any, UnsubscriptionResponse>(API_ROUTES.subscription.UNSUBSCRIPTION, data),
    saveSubscription: (data: SaveSubscriptionInput) =>
      this.#API.post<any, SaveSubscriptionResponse>(
        API_ROUTES.subscription.SAVE_SUBSCRIPTION,
        data
      ),
    getSubscriptionMsg: (data: GetSubscriptionMsg) =>
      this.#API.post<any, GetSubscriptionMsgResponse>(
        API_ROUTES.subscription.GET_SUBSCRIPTION_MSG,
        data
      ),
    delSubscriptionMsg: (data: DelSubscriptionMsg) =>
      this.#API.post(API_ROUTES.subscription.DEL_SUBSCRIPTION_MSG, data),

    updateSubscriptionMsgRead: (data: UpdateSubscriptionMsg) =>
      this.#API.post(API_ROUTES.subscription.DEL_SUBSCRIPTION_MSG, data),
  };
  dictionary = {
    saveDictionary: (data: SaveDictionaryInput) =>
      this.#API.post(API_ROUTES.dictManage.SAVE_DICTIONARY, data),
    getAllDicName: (data: GetDictionaryInput) =>
      this.#API.post(API_ROUTES.dictManage.GET_ALL_DIC_NAME, data),
    delDictionary: (data: DelDictionaryInput) =>
      this.#API.post(API_ROUTES.dictManage.DEL_DICTIONARY, data),

    getDictionaryDetail: (data: GetDicDetailDataInput) =>
      this.#API.post(API_ROUTES.dictManage.QUERY_DICT_DETAILS, data),

    delDictionaryDetail: (data: DelDictionaryDetailInput) =>
      this.#API.post(API_ROUTES.dictManage.DEL_DICT_DETAIL, data),
    updateDictionary: (data: UpdateDictionaryInput) =>
      this.#API.post(API_ROUTES.dictManage.UPDATE_DICTIONARY, data),
    addDicItem: (data: SaveDictionaryDetailInput) =>
      this.#API.post(API_ROUTES.dictManage.ADD_DICT_ITEM, data),

    updateDicItem: (data: SaveDictionaryDetailInput) =>
      this.#API.post(API_ROUTES.dictManage.UPDATE_DICT_ITEM, data),
    delDictionaryItem: (data: DelDictionaryDetailInput) =>
      this.#API.post(API_ROUTES.dictManage.DEL_DICT_ITEM, data),
    verifyPropSql: (data: any) => this.#API.post(API_ROUTES.dictManage.VERIFY_PROP_SQL, data),
    getDicByDicId: (data: any) => this.#API.post(API_ROUTES.dictManage.GET_DIC_LIST_BY_ID, data),
  };
  type = {
    selectTypeById: (data: SelectTypeByIdInput) =>
      this.#API.post<any, SelectTypeByIdResponse>(API_ROUTES.typeService.SELECT_TYPE_BY_ID, data),
    getAllTypes: (data: GetAllTypesInput) =>
      this.#API.post<any, GetAllTypesResponse>(API_ROUTES.typeService.GET_ALL_TYPES, data),
    deleteType: (data: DeleteTypeInput) =>
      this.#API.post<any, DeleteTypeResponse>(API_ROUTES.typeService.DELETE_TYPE, data),
    addNewType: (data: AddNewTypeInput) =>
      this.#API.post<any, AddNewTypeResponse>(API_ROUTES.typeService.ADD_NEW_TYPE, data),
    updateType: (data: UpdateTypeInput) =>
      this.#API.post<any, UpdateTypeResponse>(API_ROUTES.typeService.UPDATE_TYPE, data),
    addNewColumn: (data: AddNewColumnInput) =>
      this.#API.post<any, AddColumnResponse>(API_ROUTES.typeService.ADD_COLUMN, data),
    updateColumn: (data: UpdateColumnInput) =>
      this.#API.post<any, UpdateColumnResponse>(API_ROUTES.typeService.UPDATE_COLUMN, data),
    deleteColumn: (data: DeleteColumnInput) =>
      this.#API.post<any, DeleteColumnResponse>(API_ROUTES.typeService.DELETE_COLUMN, data),
    getDicList: () =>
      this.#API.post<any, GetDicListResponse>(API_ROUTES.typeService.GET_DIC_LIST, undefined),
    addNewTypeAndDraf: (data: AddNewTypeAndDrafInput) =>
      this.#API.post<any, AddNewTypeResponse>(API_ROUTES.typeService.ADD_NEW_TYPE_AND_DRAF, data),
    checkDemoAndDiss: (data: checkPermissionInput) =>
      this.#API.post<any, AddNewTypeResponse>(API_ROUTES.typeService.CHECK_DEMO_AND_DISS, data),
    getTypePermission: (data: SelectTypeByIdInput) =>
      this.#API.post<any, GetPermissionResponse>(API_ROUTES.typeService.GET_TYPE_PERMISSION, data),
    editNewTypeAndDraf: (data: AddNewTypeAndDrafInput) =>
      this.#API.post<any, AddNewTypeResponse>(API_ROUTES.typeService.EDIT_NEW_TYPE_AND_DRAF, data),
  };
  property = {
    getPropretyPageListPageable: (data: GetPropertyPageableInput) =>
      this.#API.post<any, GetPropertyPageableResponse>(API_ROUTES.property.GET_PROPERTY_PAGE, data),
    getPropertyDetail: (data: GetPropertyDetailInput) =>
      this.#API.post<any, GetPropertyDetailV2Response>(
        API_ROUTES.property.SELECT_PROPERTY_BY_ID,
        data
      ),
    updateProperty: (data: UpdatePropertyV2Input) =>
      this.#API.post(API_ROUTES.property.EDIT_PROPERTY_PAGE, data),

    addProperty: (data: UpdatePropertyV2Input) =>
      this.#API.post(API_ROUTES.property.ADD_PROPERTY_PAGE, data),

    deletePropertyById: (data: DeletePropertyInput) =>
      this.#API.post(API_ROUTES.property.DELETE_PROPERTY, data),

    savePropertyColumnPermission: (data: SavePropertyColumnPermissionInput) =>
      this.#API.post(API_ROUTES.property.SAVE_PROPERTY_COLUMN_PERMISSION, data),

    getPropertyColumnPermission: (data: GetPropertyColumnPermissionInput) =>
      this.#API.post(API_ROUTES.property.GET_PROPERTY_COLUMN_PERMISSION, data),
    selectPropertyConfigDetailById: (data: GetPropertyDetailInput) =>
      this.#API.post<any, GetPropertyConfigDetailResponse>(
        API_ROUTES.property.SELECT_PROPERTY_CONFIG_DETAIL_BY_ID,
        data
      ),
  };
  sysConfig = {
    getSysConfigList: () => this.#API.post(API_ROUTES.sysConfig.FIND_SYS_CONFIG_LIST, {}),
    addSystemConfig: (data: AddSysConfigInput) =>
      this.#API.post(API_ROUTES.sysConfig.SAVE_SYS_CONFIG, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    deleteSystemConfig: (data: DeleteSysConfigInput) =>
      this.#API.post(API_ROUTES.sysConfig.DELETE_SYS_CONFIG, data),
    getWorkflowSwitch: () => this.#API.post(API_ROUTES.sysConfig.GET_WORKFLOW_SWITCH, {}),
    findSysConfigByKey: (data: FindSysConfigByKeyInput) =>
      this.#API.post<FindSysConfigByKeyInput, FindSysConfigByKeyResponse>(
        API_ROUTES.sysConfig.FIND_BY_KEY,
        data
      ),
  };
  organization = {
    saveOrgName: (data: SaveOrgNameInput) =>
      this.#API.post(API_ROUTES.organization.SAVE_ORGANIZATION, data),
    getSysConfigOrgItems: () => this.#API.get(API_ROUTES.organization.GET_ORG_LIST),
    deleteOrgById: (data: DeleteOrgInput) =>
      this.#API.post(API_ROUTES.organization.DELETE_ORG, data),
  };
  auditManage = {
    getAllAudit: (data: GetAuditPageInput) =>
      this.#API.post(API_ROUTES.auditManage.GET_ALL_AUDIT, data),
  };
  report = {
    getTemplate: () => this.#API.post(API_ROUTES.report.GET_TEMPLATE),
    getReports: (data: GetReportsInput) => this.#API.post(API_ROUTES.report.GET_REPORTS, data),
    // generateReports: (data: GenerateReportInput) =>
    //   this.#API.post(API_ROUTES.report.GENERATE_REPORT, data),
    exportStatisticsReport: (data: GenerateStatisticReportInput) =>
      this.#API.post(API_ROUTES.report.EXPORT_STATISTICS, data),
    exportInventoryReport: (data: GenerateInventoryReportInput) =>
      this.#API.post(API_ROUTES.report.EXPORT_INVENTORY, data),
    downloadReport: (data: DownloadReportInput) =>
      this.#API.post<any, Blob>(API_ROUTES.report.DOWNLOAD_REPORT, data, {
        responseType: 'blob',
      }),
  };
  exportService = {
    ExportXls: (data: any) =>
      this.#API.post<any, Blob>(API_ROUTES.exportService.exportXls, data, {
        responseType: 'blob',
      }),
    ExportXlsx: (data: any) =>
      this.#API.post<any, Blob>(API_ROUTES.exportService.exportXlsx, data, {
        responseType: 'blob',
      }),
    ExportCsv: (data: any) =>
      this.#API.post<any, Blob>(API_ROUTES.exportService.exportCsv, data, {
        responseType: 'blob',
      }),
    SimpleSearchExport: (data: any) =>
      this.#API.post<any, Blob>(API_ROUTES.exportService.simpleSearchExport, data, {
        responseType: 'blob',
      }),
  };
  storage = {
    getStorageListPageable: (data: GetStorageListPageableInput) =>
      this.#API.post<any, GetStorageListPageableResponse>(
        API_ROUTES.storage.FIND_STORAGE_LIST,
        data
      ),
    addStorage: (data: AddStorageInput) => this.#API.post(API_ROUTES.storage.ADD_STORAGE, data),
    updateStorage: (data: UpdateStorageInput) =>
      this.#API.post(API_ROUTES.storage.UPDATE_STORAGE, data),
    deleteStorageById: (data: DeleteStorageByIdInput) =>
      this.#API.post<any, DeleteStorageByIdResponse>(API_ROUTES.storage.DELETE_STORAGE, data),
    getStorageDetail: (data: GetStorageDetailById) =>
      this.#API.post<any, GetStorageDetailByIdResponse>(API_ROUTES.storage.DETAIL_STORAGE, data),
  };
  renditionService = {
    uploadRendition: (data: FormData) =>
      this.#API.post(API_ROUTES.renditionService.UPLOAD_RENDITION, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    getRenditionByRecordId: (data: GetRenditionInput) =>
      this.#API.post<any, QueryRenditionDataResponse>(
        API_ROUTES.renditionService.GET_RENDITION_BY_RECORDID,
        data
      ),
    deleteRenditionByRenditionId: (data: DeleteRenditionInput) =>
      this.#API.post<any, DeleteRenditionResponse>(
        API_ROUTES.renditionService.DELETE_RENDITION_BY_RENDITIONID,
        data
      ),
  };
  contentService = {
    uploadFiles: (data: FormData) =>
      this.#API.post(API_ROUTES.contentService.UPLOAD_FILES, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    mergeContentChumksFile: (data: mergeContentChumksInput) =>
      this.#API.post(API_ROUTES.contentService.MERGE_CONTENT_CHUMKS_FILE, data),
  };
  autolinkManage = {
    queryColumnByTypeId: (data: queryColumnInput) =>
      this.#API.post(API_ROUTES.autolinkManage.QUERY_COLUMN_BY_TYPE_ID, data),
    deleteAutolinkById: (data: deleteAutolinkInput) =>
      this.#API.post(API_ROUTES.autolinkManage.DELETE_AUTOLINK_BY_ID, data),
    queryAllTypesNoWith: () => this.#API.post(API_ROUTES.autolinkManage.QUERY_ALL_TYPES_NO_WITH),
    getAllAutoLink: (data: GetAutoListPageableInput) =>
      this.#API.post(API_ROUTES.autolinkManage.GET_ALL_AUTOLINK, data),
    editAutoLink: (data: EditAutolinkInput) =>
      this.#API.post(API_ROUTES.autolinkManage.EDIT_AUTOLINK, data),
    saveAutoLink: (data: autoLinkInput) =>
      this.#API.post(API_ROUTES.autolinkManage.SAVE_AUTOLINK, data),
  };
  versionManage = {
    delVersion: (data: deleteVersionInput) =>
      this.#API.post(API_ROUTES.versionManage.DEL_VERSION, data),
    getAllVersion: (data: GetVersionListPageableInput) =>
      this.#API.post(API_ROUTES.versionManage.GET_ALL_VERSION, data),
    downloadFileFunction: (data: downloadInput, progress: (evt: AxiosProgressEvent) => void) =>
      this.#API.post<any, Blob>(API_ROUTES.versionManage.DOWNLOAD_FILE, data, {
        responseType: 'blob',
        onDownloadProgress: (evt) => {
          console.log(evt);
          progress(evt);
        },
      }),
    UpLoadCheckFile: (data: uploadVersionInput) =>
      this.#API.post(API_ROUTES.versionManage.UP_LOAD_CHECK_FILE, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    isUpload: (data: isUploadInput) => this.#API.post(API_ROUTES.versionManage.IS_UPLOAD, data),
    uploadBigFile: (data: FormData) =>
      this.#API.post(API_ROUTES.versionManage.UPLOAD_BIG_FILE, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    mergeChumksFile: (data: mergeChumksInput) =>
      this.#API.post(API_ROUTES.versionManage.MERGE_CHUMKS_FILE, data),
    downBigFile: (data: downloadInput) =>
      this.#API.post(API_ROUTES.versionManage.DOWN_BIG_FILE, data, {
        responseType: 'blob',
      }),
    downloadChunkFile: (data: downloadChunkInput, progress: (evt: AxiosProgressEvent) => void) => {
      this.#API.interceptors.response.eject(this.interceptor);
      this.#API.interceptors.response.use(
        (response: AxiosResponse) => {
          //console.log(response);
          return response;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
      return this.#API.post<Blob>(API_ROUTES.versionManage.DOWN_LOAD_CHUNK_FILE, data, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        onDownloadProgress: (evt) => {
          progress(evt);
        },
      });
    },
  };
  typeRefService = {
    getAllTypeRef: (data: GetAllTypeRefInput) =>
      this.#API.post<any, GetAllTypeRefResponse>(API_ROUTES.typeRefService.GET_ALL_TYPE_REF, data),
    addTypeRef: (data: AddTypeRefInput) =>
      this.#API.post(API_ROUTES.typeRefService.ADD_TYPE_REF, data),
    updateTypeRef: (data: UpdateTypeRefInput) =>
      this.#API.post(API_ROUTES.typeRefService.UPDATE_TYPE_REF, data),
    deleteTypeRef: (data: DeleteTypeRefInput) =>
      this.#API.post(API_ROUTES.typeRefService.DELETE_TYPE_REF, data),
    getCrossRefById: (data: GetCrossRefByIdInput) =>
      this.#API.post<any, GetCrossRefByIdResponse>(
        API_ROUTES.typeRefService.GET_CROSS_REF_BY_ID,
        data
      ),
  };
  biTool = {
    getAllBiToolByPage: (data: GetAllBiToolByPageInput) =>
      this.#API.post(API_ROUTES.biTool.GET_ALL_BI_TOOL_BY_PAGE, data),
    getAllBiTool: () =>
      this.#API.post<
        Array<{
          misBiConfigId: string;
          misBiConfigName: string;
          misBiConfigTypeId: string;
          misBiConfigGraphicType: string;
          misBiConfigColumnHor: string;
          misBiConfigColumnVet: string;
          misBiConfigDate: string;
          misBiConfigDefView: string;
        }>
      >(API_ROUTES.biTool.GET_ALL_BI_TOOL),
    delBiTool: (data: DelBiToolInput) => this.#API.post(API_ROUTES.biTool.DEL_BI_TOOL, data),
    getBiTool: (data: GetBiToolInput) => this.#API.post(API_ROUTES.biTool.GET_BI_TOOL, data),
    editBiTool: (data: EditBiToolInput) => this.#API.post(API_ROUTES.biTool.EDIT_BI_TOOL, data),
    addBiTool: (data: AddBiToolInput) => this.#API.post(API_ROUTES.biTool.ADD_BI_TOOL, data),
    queryTableData: () => this.#API.post(API_ROUTES.biTool.QUERY_TABLE_DATA),
    queryColumnData: (data: columnBiInput) =>
      this.#API.post(API_ROUTES.biTool.QUERY_COLUMN_DATA, data),
    countTableColumnData: (data: countColumnInput) =>
      this.#API.post<Array<{ countData: number; columnName: string; date?: string }>>(
        API_ROUTES.biTool.COUNT_TABLE_COLUMN_DATA,
        data
      ),
    countTableColumnDataByDate: (data: countColumnInput) =>
      this.#API.post<Array<{ countData: number; columnName: string; date: string }>>(
        API_ROUTES.biTool.COUNT_TABLE_COLUMN_DATA_BY_DATE,
        data
      ),
    countWorkFlowData: () =>
      this.#API.post<Array<{ countData: number; columnName: string; date?: string }>>(
        API_ROUTES.biTool.COUNT_WORKFLOW_DATA
      ),
    countWorkFlowDataByDate: () =>
      this.#API.post<Array<{ countData: number; columnName: string; date: string }>>(
        API_ROUTES.biTool.COUNT_WORKFLOW_DATA_BY_DATE
      ),
  };
  workflow = {
    getAllProcess: (data: GetAllProcessInput) =>
      this.#API.post<any, GetAllProcessResponse>(API_ROUTES.workflow.GET_ALL_PROCESS, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    initWorkflow: (data: any) =>
      this.#API.post(API_ROUTES.workflow.initWorkflow, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    submitWorkflow: (data: any) =>
      this.#API.post(API_ROUTES.workflow.submitWorkflow, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getProcessDetail: (data: GetProcessDetailById) =>
      this.#API.post<any, GetProcessDetailByIdResponse>(API_ROUTES.workflow.DETAIL_PROCESS, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getAllActivities: (data: GetAllActivitiesInput) =>
      this.#API.post<any, GetAllActivitiesResponse>(API_ROUTES.workflow.GET_ALL_ACTIVITIES, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getWorkflowList: (data: any) =>
      this.#API.post<any, GetWorkflowResponse>(API_ROUTES.workflow.workflowList, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    changeOwner: (data: any) =>
      this.#API.post(API_ROUTES.workflow.changeOwner, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
  };
  myInbox = {
    getMyInboxListByUserId: (data: GetMyInboxList) =>
      this.#API.post(API_ROUTES.myInbox.GET_ALL_INBOX, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getMyOutboxListByUserId: (data: GetMyInboxList) =>
      this.#API.post(API_ROUTES.myInbox.GET_ALL_OUTBOX, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getTaskListByUserId: (data: GetMyInboxList) =>
      this.#API.post(API_ROUTES.myInbox.GET_ALL_TASK, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getAttachmentsByWfWorkflowId: (data: GetAttachmentList) =>
      this.#API.post(API_ROUTES.myInbox.GET_ATTACHMENTS, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getTaskDetail: (data: IdInput) =>
      this.#API.post(API_ROUTES.myInbox.GET_TASK_DETAIL, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    acquireTask: (data: AcquireTaskInput) =>
      this.#API.post(API_ROUTES.myInbox.ACQUIRE_TASK, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    approveTask: (data: ApproveTaskInput) =>
      this.#API.post(API_ROUTES.myInbox.APPROVE_TASK, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    rejectTask: (data: RejectTaskInput) =>
      this.#API.post(API_ROUTES.myInbox.REJECT_TASK, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    delegateTask: (data: DelegateTaskInput) =>
      this.#API.post(API_ROUTES.myInbox.DELEGATE_TASK, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    terminateWorkflow: (data: TerminateWorkflowInput) =>
      this.#API.post(API_ROUTES.myInbox.TERMINATE_WORKFLOW, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    withdrawWorkflow: (data: WithdrawWorkflowInput) =>
      this.#API.post(API_ROUTES.myInbox.WITHDRAW_WORKFLOW, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getCommentByWorkflowId: (data: IdInput) =>
      this.#API.post<any, GetCommentListResponse>(API_ROUTES.myInbox.GET_COMMENT, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    saveTaskComment: (data: SaveTaskCommentInput) =>
      this.#API.post(API_ROUTES.myInbox.SAVE_COMMENT, data, {
        baseURL: process.env['NX_API_URL_02'],
      }),
    getCommentByTypeIdAndRecId: (data: typeAndRecInput) =>
      this.#API.post<any, GetCommentListResponse>(API_ROUTES.myInbox.GET_COMMENT_BY_TYPE_AND_REC, data, {
          baseURL: process.env['NX_API_URL_02'],
        }),
  };

  widget = {
    getWidgetList: () =>
      this.#API.post(API_ROUTES.widget.GET_WIDGET_LIST, {
        baseURL: process.env['NX_API_URL'],
      }),

    getWidgetListByPage: (data: GetWidgetDataInput) =>
      this.#API.post(API_ROUTES.widget.GET_WIDGET_LIST_BY_PAGE, data, {
        baseURL: process.env['NX_API_URL'],
      }),

    getWidgetById: (data: GetWidgetInput) =>
      this.#API.post(API_ROUTES.widget.GET_WIDGET_BY_ID, data, {
        baseURL: process.env['NX_API_URL'],
      }),
    getSimpleSearchById: (data: GetWidgetInput) =>
      this.#API.post(API_ROUTES.widget.GET_SIMPLESEARCH_BY_ID, data, {
        baseURL: process.env['NX_API_URL'],
      }),
    addWidget: (data: WidgetItem) =>
      this.#API.post(API_ROUTES.widget.ADD_WIDGET, data, {
        baseURL: process.env['NX_API_URL'],
      }),

    editWidget: (data: WidgetItem) =>
      this.#API.post(API_ROUTES.widget.EDIT_WIDGET, data, {
        baseURL: process.env['NX_API_URL'],
      }),

    deleteWidget: (data: GetWidgetInput) =>
      this.#API.post(API_ROUTES.widget.DELETE_WIDGET, data, {
        baseURL: process.env['NX_API_URL'],
      }),
  };

  simpleSearch = {
    getSimpleSearchListPageable: (data: GetSimpleSearchDataInput) =>
      this.#API.post(API_ROUTES.simpleSearch.GET_SIMPLE_SEARCH_LIST_BY_PAGE, data),
    addSimpleSearch: (data: AddSimpleSearchInput) =>
      this.#API.post(API_ROUTES.simpleSearch.ADD_SIMPLE_SEARCH, data),
    editSimpleSearch: (data: EditSimpleSearchInput) =>
      this.#API.post(API_ROUTES.simpleSearch.EDIT_SIMPLE_SEARCH, data),
    deleteSimpleSearch: (data: GetSimpleSearchByIdInput) =>
      this.#API.post(API_ROUTES.simpleSearch.DELETE_SIMPLE_SEARCH, data),
    getSimpleSearchById: (data: GetSimpleSearchByIdInput) =>
      this.#API.post<any, GetSimpleSearchByIdResponse>(
        API_ROUTES.simpleSearch.GET_SIMPLE_SEARCH_BY_ID,
        data
      ),
    simpleSearchRecord: (data: SimpleSearchRecordInput) =>
      this.#API.post<any, SearchRecordsResponse>(
        API_ROUTES.simpleSearch.SIMPLE_SEARCH_RECORD,
        data
      ),
    getSimpleSearchDic: () =>
      this.#API.post<any, GetSimpleSearchDicResponse>(
        API_ROUTES.simpleSearch.GET_SIMPLE_SEARCH_DIC
      ),
    getHADRecord: (data: GetHadRecordInput) =>
      this.#API.post<any, SearchRecordsResponse>(API_ROUTES.simpleSearch.GET_HAD_RECORD, data),
    getHADViewChange: (data: GetHadRecordInput) =>
      this.#API.post<any, GetHadViewChangeResponse>(
        API_ROUTES.simpleSearch.GET_HAD_VIEW_CHANGE,
        data
      ),
  };
  relation = {
    addRelation: (data: AddRelationInput) => this.#API.post(API_ROUTES.relation.ADD_RELATION, data),
    getRelationByTypeId: (data: TypeIdInput) =>
      this.#API.post(API_ROUTES.relation.GET_RELATION_BY_TYPE_ID, data),
    deleteRelationRec: (data: DeleteRelationInput) =>
      this.#API.post(API_ROUTES.relation.DELETE_RELATION_REC, data),
  };
  publication = {
    insertRecord: (data: any) => this.#API.post(API_ROUTES.publication.INSERT_RECORD, data),
    upadteRecord: (data: any) => this.#API.post(API_ROUTES.publication.UPDATE_RECORD, data),
    removeRecord: (data: any) => this.#API.post(API_ROUTES.publication.REMOVE_RECORD, data),
    publicRecord: (data: any) => this.#API.post(API_ROUTES.publication.PUBLIC_RECORD, data),
    scheduleRecord: (data: any) => this.#API.post(API_ROUTES.publication.SCHEDULE_RECORD, data),
    publicResult: (data: any) => this.#API.post(API_ROUTES.publication.PUBLIC_RESULT, data),
  };
  welcomePage = {
    uploadEditorImage: (data: FormData) =>
      this.#API.post(API_ROUTES.welcomePage.UPLOAD_EDITOR_IMAGE, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    AddWelcomeData: (data: AddWelcomeInput) =>
      this.#API.post(API_ROUTES.welcomePage.ADD_WELCOMEDATA, data),
    getWelcome: () => this.#API.post(API_ROUTES.welcomePage.GET_WELCOME),
  };
}
