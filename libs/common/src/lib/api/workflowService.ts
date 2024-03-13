import { PaginationInput, DataResponse } from './common';

export interface WorkflowData {
  workflowId: string;
  workflowName: string;
  workflowDate: string;
  activityName: string;
  workflowStatus: string;
  owner: string;
  supervisor: string;
}

export type GetWorkflowInput = PaginationInput;

export type GetWorkflowResponse = DataResponse<{ data: WorkflowData[]; total: number }>;
