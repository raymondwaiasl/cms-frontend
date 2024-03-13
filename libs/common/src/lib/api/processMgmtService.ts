import { PaginationInput, DataResponse } from './common';

export interface ProcessData {
  wfProcessId: string;
  wfProcessName: string;
  creatorBy: string;
  creationDate: string;
}

export type GetAllProcessInput = PaginationInput;

export type GetAllProcessResponse = DataResponse<{ data: ProcessData[]; total: number }>;

export interface ProcessDetail {
  wfProcessId: string;
  wfProcessName: string;
  wfProcessCompletionStratedge: string;
  wfProcessHasNotification: string;
  wfProcessNotificationSubject: string;
  wfProcessNotificationContent: string;
  processActivities: ProcessActivities[];
  processPeople: ProcessPerson[];
}

export interface AddProcessInput {
  wfProcessName: string;
  wfProcessCompletionStratedge: string;
  wfProcessHasNotification: string;
  wfProcessNotificationSubject: string;
  wfProcessNotificationContent: string;
  processActivities: ProcessActivities[];
  processPeople: ProcessPerson[];
}

export interface UpdateProcessInput {
  wfProcessId: string;
  wfProcessName: string;
  wfProcessCompletionStratedge: string;
  wfProcessHasNotification: string;
  wfProcessNotificationSubject: string;
  wfProcessNotificationContent: string;
  processActivities: ProcessActivities[];
  processPeople: ProcessPerson[];
}

export interface ProcessActivities {
  wfProcessActivitiesId: string;
  wfProcessId: string;
  wfProcessActivitiesActivity1Id: string;
  wfProcessActivitiesActivity2Id: string;
  wfProcessActivitiesPledge: string;
  wfProcessActivitiesStep: string;
  wfProcessActivitiesPrevAct: string;
  wfProcessActivitiesNextAct: string;
}
export interface ProcessPerson {
  wfProcessPersonId: string;
  wfProcessId: string;
  wfProcessPersonUserId: string;
  wfProcessPersonType: string;
}

export interface DeleteProcessByIdInput {
  id: string;
}

export interface DeleteProcessByIdResponse {
  status: string;
  message: string;
  data: null;
}

export interface GetProcessDetailById {
  id: string;
}

export type GetProcessDetailByIdResponse = DataResponse<ProcessDetail>;

export interface ActivityOptionData {
  wfActivityId: string;
  wfActivityName: string;
  wfActivityType: string;
  isDisable: boolean;
  creatorBy: string;
  creationDate: string;
}
