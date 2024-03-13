export interface SaveColumnConfigInput {
  qfConditions: QfConditions[];
}

export interface QfConditions {
  misQfId?: string;
  misQfc2ColumnId: string;
  misQfc2Condition: string;
  misQfc2Id?: string;
  misQfc2Value: string;
  misRelation?: string;
}
