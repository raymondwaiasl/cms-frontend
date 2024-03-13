import { DataResponse, PaginationInput } from './common';

export type GetReportsInput = PaginationInput;

export interface ExportReportInput {
  id?: string;
  typeId?: string;
  dateFrom: string;
  dateTo: string;
  format: string;
}

export interface GenerateReportInput {
  templateId: string;
}

export interface GenerateStatisticReportInput {
  dateFrom: string;
  dateTo: string;
  format: string;
}

export interface GenerateInventoryReportInput {
  dateFrom: string;
  dateTo: string;
  format: string;
  typeId: string;
}

export interface DownloadReportInput {
  misReportId: string;
}

export interface DownloadReportResponse {}
