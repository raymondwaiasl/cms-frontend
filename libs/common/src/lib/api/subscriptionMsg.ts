import { DataResponse, PaginationInput } from './common';

export type GetSubscriptionMsg = PaginationInput;

export interface SubscriptionMsg {
  misSubscriptionMsgId: string;
  misFolderName: string;
  misSubscriptionType: string;
  misSubEventMsg: string;
  misSubscriptionMsgDate: string;
}

export type GetSubscriptionMsgResponse = DataResponse<{ data: SubscriptionMsg[]; total: number }>;

export interface DelSubscriptionMsg {
  msgId: string;
}

export interface UpdateSubscriptionMsg {
  msgId: string;
}
