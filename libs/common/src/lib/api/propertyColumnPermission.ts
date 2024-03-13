import { QueryGroupDataInput } from './permissionService';

export interface SavePropertyColumnPermissionInput {
  misPropertyConfigDetailColumnId: string;
  columnPermission: ColumnPermissions[];
}

export interface ColumnPermissions {
  misPropertyColumnPermissionId: string;
  misPropertyConfigDetailColumnId: string;
  misPdType: QueryGroupDataInput['id'];
  misPdPerformerId: string;
  misPdAction: '1' | '2';
}

export interface GetPropertyColumnPermissionInput {
  misPropertyConfigDetailColumnId: string;
}
