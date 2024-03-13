import { DataResponse, PageState, SortModel } from './common';

export interface DictionaryName {
  key: string;
  value: string;
}

export interface DictionaryList {
  data: DictionaryName[];
  total: number;
}

export type GetDictionaryResponse = DataResponse<DictionaryList>;

export interface GetDictionaryInput {
  pageState: PageState;
  sortModel: SortModel;
}

export interface SaveDictionaryInput {
  dicId?: string;
  dicName: string;
  propType: number;
}

export interface UpdateDictionaryInput {
  dicId: string;
  dicName?: string;
  propSql?: string;
}

export interface DelDictionaryInput {
  id: string;
}

export interface GetDicDetailDataInput {
  id: string;
  pageState: PageState;
  sortModel: SortModel;
}

export interface DelDictionaryDetailInput {
  keyId: string;
}

export interface SaveDictionaryDetailInput {
  dicId: string;
  dicName?: string;
  keyId: string;
  key: string;
  value: string;
}
