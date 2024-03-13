import { atom } from 'recoil';

const MemberAtom = atom({ key: 'MemberAtom', default: {} });
const OrgChartAtom = atom({ key: 'OrgChartAtom', default: {} });
const FolderBrowserAtom = atom({ key: 'FolderBrowserAtom', default: {} });
const PermissionAtom = atom({ key: 'PermissionAtom', default: {} });
const RecordCreationAtom = atom({ key: 'RecordCreationAtom', default: {} });
const HadRecordCreationAtom = atom({ key: 'HadRecordCreationAtom', default: {} });
const RecordListAtom = atom({ key: 'RecordListAtom', default: {} });
const ChildRecordListAtom = atom({ key: 'ChildRecordListAtom', default: {} });
const QueryRecordListAtom = atom({ key: 'QueryRecordListAtom', default: {} });
const RecordAuditDetailAtom = atom({ key: 'RecordAuditDetailAtom', default: {} });
const RecordHistoryAtom = atom({ key: 'RecordHistoryAtom', default: {} });
const RecordHistoryLogAtom = atom({ key: 'RecordHistoryLogAtom', default: {} });
const RecordComparisonAtom = atom({ key: 'RecordComparisonAtom', default: {} });
const DataImportAtom = atom({ key: 'DataImportAtom', default: {} });
const DataExportAtom = atom({ key: 'DataExportAtom', default: {} });
const PropertiesAtom = atom({ key: 'PropertiesAtom', default: {} });
const MySubscriptionsAtom = atom({ key: 'MySubscriptionsAtom', default: {} });
const ReportAtom = atom({ key: 'ReportAtom', default: {} });
const MySearchAtom = atom({ key: 'MySearchAtom', default: {} });
const SearchFormAtom = atom({ key: 'SearchFormAtom', default: {} });
const RenditionAtom = atom({ key: 'RenditionAtom', default: {} });
const contentCreationAtom = atom({ key: 'ContentCreationAtom', default: {} });
const autoLinkPageAtom = atom({ key: 'AutoLinkPageAtom', default: {} });
const AutoLinkDetailPageAtom = atom({ key: 'AutoLinkDetailPageAtom', default: {} });
const versionAtom = atom({ key: 'VersionAtom', default: {} });
const barChartAtom = atom({ key: 'BarChartAtom', default: {} });
const myInboxAtom = atom({ key: 'MyInboxAtom', default: {} });
const myOutboxAtom = atom({ key: 'MyOutboxAtom', default: {} });
const taskDetailAtom = atom({ key: 'TaskDetailAtom', default: {} });
const taskCommentAtom = atom({ key: 'taskCommentAtom', default: {} });
const gisAtom = atom({ key: 'GisAtom', default: {} });
const emailEditorAtom = atom({ key: 'EmailEditorAtom', default: {} });
const SimpleSearchAtom = atom({ key: 'SimpleSearchAtom', default: {} });
const RecordEditHistoryAtom = atom({ key: 'RecordEditDataAtom', default: {} });
const HadRecordListAtom = atom({ key: 'HadRecordListAtom', default: {} });
const HadViewChangeAtom = atom({ key: 'HadViewChangeAtom', default: {} });
const PositionCreationAtom = atom({ key: 'PositionCreationAtom', default: {} });
const Publication = atom({ key: 'Publication', default: {} });

const widgetAtom = {
  Member: MemberAtom,
  'Org Chart': OrgChartAtom,
  'Folder Browser': FolderBrowserAtom,
  Permission: PermissionAtom,
  'Record Creation': RecordCreationAtom,
  'Had Record Creation': HadRecordCreationAtom,
  'Record List': RecordListAtom,
  'Child Record List': ChildRecordListAtom,
  'Query Record List': QueryRecordListAtom,
  'Record Audit Detail': RecordAuditDetailAtom,
  'Record History': RecordHistoryAtom,
  'Record History Log': RecordHistoryLogAtom,
  'Record Comparison': RecordComparisonAtom,
  'Data Import': DataImportAtom,
  'Data Export': DataExportAtom,
  Properties: PropertiesAtom,
  'My Subscriptions': MySubscriptionsAtom,
  Report: ReportAtom,
  'My Search': MySearchAtom,
  'Search Form': SearchFormAtom,
  'Content Creation': contentCreationAtom,
  Rendition: RenditionAtom,
  autolinkpage: autoLinkPageAtom,
  AutolinkDetailpage: AutoLinkDetailPageAtom,
  Version: versionAtom,
  'Bar Chart': barChartAtom,
  'My Inbox': myInboxAtom,
  'My Outbox': myOutboxAtom,
  'Task Detail': taskDetailAtom,
  'Task Comment': taskCommentAtom,
  GIS: gisAtom,
  EmailEditor: emailEditorAtom,
  'Simple Search': SimpleSearchAtom,
  'Record Edit Data': RecordEditHistoryAtom,
  'HAD Record List': HadRecordListAtom,
  'HAD View Change': HadViewChangeAtom,
  'Position Creation': PositionCreationAtom,
  'Publication':Publication,
};

export default widgetAtom;
