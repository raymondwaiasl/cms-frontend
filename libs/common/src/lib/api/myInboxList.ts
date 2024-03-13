import { PaginationInput, DataResponse } from './common';

export type GetMyInboxList = PaginationInput;

export type GetAttachmentList = {
  id: string;
  page: PaginationInput;
};

export interface MyInbox {
  workflowId: string;
  workflowActivityId: string;
  wfWorkflowName: string;
  wfActivityName: string;
  misTypeLabel: string;
  userId: string;
  sentDate: string;
}

export interface AcquireTaskInput {
  workflowId: string;
  workflowActivityId: string;
  userId: string;
  acquireDate: string;
}

export interface ApproveTaskInput {
  workflowId: string;
  workflowActivityId: string;
  userId: string;
  toUserId?: string;
  approveDate: string;
  comment: string;
}

export interface RejectTaskInput {
  workflowId: string;
  workflowActivityId: string;
  userId: string;
  rejectDate: string;
  comment: string;
}

export interface DelegateTaskInput {
  workflowId: string;
  workflowActivityId: string;
  fromUserId: string;
  toUserId: string;
  delegateDate: string;
  comment: string;
}

export interface TerminateWorkflowInput {
  workflowId: string;
  userId: string;
  terminateDate: string;
  comment: string;
}

export interface WithdrawWorkflowInput {
  workflowId: string;
  userId: string;
  withdrawDate: string;
  comment: string;
}

export interface IdInput {
  id: string;
}

export interface SaveTaskCommentInput {
  workflowId: string;
  workflowActivityId: string;
  userId: string;
  comment: string;
}

export type GetMyInboxListResponse = DataResponse<{ data: MyInbox[]; total: number }>;

export interface TaskCommentDto {
  wfCommentId: string;
  workflowId: string;
  workflowActivityId: string;
  wfWorkflowName: string;
  wfActivityName: string;
  wfCommentContent: string;
  wfCommentCommentator: string;
  userId: string;
  wfCommentDate: string;
}

export interface typeAndRecInput {
  typeId: string;
  recordId: string;
}

export type GetCommentListResponse = DataResponse<TaskCommentDto[]>;
