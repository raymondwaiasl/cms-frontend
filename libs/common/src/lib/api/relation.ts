export interface AddRelationInput {
  typeId: string;
  relations: Relations[];
}
export interface DeleteRelationInput {
  parentRecId: string;
  childRecId: string;
}
export interface Relations {
  tableId?: string;
  isReversive?: string;
}
export interface TypeIdInput {
  tableId: string;
}
