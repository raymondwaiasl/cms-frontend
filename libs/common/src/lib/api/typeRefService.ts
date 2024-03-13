import { PaginationInput, DataResponse } from './common';
import { DicItem } from './propertyPage';

export interface GetAllTypeRefInput extends PaginationInput {
  tableId: string;
}
export type GetAllTypeRefResponse = DataResponse<{
  total: number;
  data: {
    misCrossRefId: string;
    misCrossRefName: string;
    misCrossRefParentTableID: string;
    misCrossRefParentTableLabel: string;
    misCrossRefParentTableName: string;
    misCrossRefParentKey: string;
    misCrossRefParentKeyLabel: string;
    misCrossRefParentKeyName: string;
    misCrossRefChildTableID: string;
    misCrossRefChildTableLabel: string;
    misCrossRefChildTableName: string;
    misCrossRefChildKey: string;
    misCrossRefChildKeyLabel: string;
    misCrossRefChildKeyName: string;
  }[];
}>;
export interface AddTypeRefInput {
  misCrossRefId: string;
  misCrossRefName: string;
  misCrossRefParentTable: string;
  misCrossRefParentKey: string;
  misCrossRefChildTable: string;
  misCrossRefChildKey: string;
}
export type UpdateTypeRefInput = AddTypeRefInput;

export type DeleteTypeRefInput = {
  id: string;
};

export type GetCrossRefByIdResponse = DataResponse<DicItem[]>;

export type GetCrossRefByIdInput = {
  id: string;
};
