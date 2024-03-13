import { PaginationInput, DataResponse } from './common';

export interface ActivityData {
  wfActivityId: string;
  wfActivityName: string;
  wfActivityType: string;
  creatorBy: string;
  creationDate: string;
}
export interface DeleteActivityInput {
  wfActivityId: string;
}
export interface AddActivitesInput {
  wfActivityId: string;
  wfActivityType: string;
  wfActivityName: string;
  performerUserValue: string;
  distributionUserValue: string;
  wfActivityOwnerStratedge: string;
  wfActivityCompletionStratedge: string;
  Notification: string;
  subject: string;
  content: string;
}

export type GetAllActivitiesInput = PaginationInput;

export type GetAllActivitiesResponse = DataResponse<{ data: ActivityData[]; total: number }>;

export interface ActivityDetail {
  wfActivityId: string;
  wfActivityName: string;
  wfActivityOwnerStratedge: string;
  wfActivityCompletionStratedge: string;
  wfActivityType: string;
  activityPerformers: ActivityPerformer[];
  activityConfigs: ActivityConfig[];
}

export interface AddActivityInput {
  wfActivityName: string;
  wfActivityOwnerStratedge: string;
  wfActivityCompletionStratedge: string;
  wfActivityType: string;
  activityPerformers: ActivityPerformer[];
  activityConfigs: ActivityConfig[];
}

export interface UpdateActivityInput {
  wfActivityId: string;
  wfActivityName: string;
  wfActivityOwnerStratedge: string;
  wfActivityCompletionStratedge: string;
  wfActivityType: string;
  activityPerformers: ActivityPerformer[];
  activityConfigs: ActivityConfig[];
}

export interface ActivityPerformer {
  wfActivityPerformerId: string;
  wfActivityId: string;
  wfActivityPerfomerUserId: string;
  wfActivityPerformerType: string;
}
export interface ActivityConfig {
  wfActivityConfigId: string;
  wfActivityId: string;
  wfActivityConfigName: string;
  wfActivityConfigValue: string;
}

export interface DeleteActivityByIdInput {
  id: string;
}

export interface DeleteActivityByIdResponse {
  status: string;
  message: string;
  data: null;
}

export interface GetActivityDetailById {
  id: string;
}

export interface ActivityOcrDetail {
  wfActivityId: string;
  wfActivityName: string;
  wfActivityType: string;
  serviceUrl: string;
  serviceAccount: string;
  password: string;
  eng: boolean;
  chi_tra: boolean;
  chi_sim: boolean;
  outputFormat: string;
}

export type GetActivityDetailByIdResponse = DataResponse<ActivityDetail>;

export type GetOcrActivityDetailByIdResponse = DataResponse<ActivityOcrDetail>;
