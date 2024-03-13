import { DataResponse } from './common';

export type QueryRenditionDataInput = {
  id: string;
};

export interface QueryRenditionData {
  cmsRenditionId: string;
  misTypeId: string;
  misRecordId: string;
  cmsIsPrimary: string;
  cmsFormatId: string;
  cmsRenditionFile: string;
  cmsRenditionDate: string;
  cmsCreatorUserId: string;
  cmsFileLocation: string;
  user: {};
  format: {};
}

export interface GetRenditionInput {
  id: string;
}

export type QueryRenditionDataResponse = DataResponse<QueryRenditionData[]>;

export type SaveRenditionResponse = DataResponse<boolean>;

export interface DeleteRenditionInput {
  id: string;
}

export type DeleteRenditionResponse = SaveRenditionResponse;
