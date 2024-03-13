import { DataResponse, PageState, SortModel } from './common';

export interface AuditPageDetail {
  misAuditId: string;
  misAuditUser: string;
  misAuditOperation: string;
  misAuditTime: number;
  misAuditMethod: string;
  misAuditParams: string;
  misAuditIp: string;
  createTime: string;
}

export interface GetAuditPageInput {
  auditCreateTime: string;
  auditOperation: string;
  auditUser: string;
  pageState: PageState;
  sortModel: SortModel;
}

export type GetAuditPageResponse = DataResponse<{
  data: GetAuditPageInput[];
  total: number;
}>;
