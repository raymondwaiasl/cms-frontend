import dataStore from '../store/dataStoreNew';
import { useRecoilState, useResetRecoilState } from 'recoil';

const useStore = (key?: keyof typeof dataStore) => {
  const [member, setMember] = useRecoilState<{ [key: string]: any }>(dataStore.Member);
  const [orgChart, setOrgChart] = useRecoilState<{ [key: string]: any }>(dataStore['Org Chart']);
  const[postitionCreation,setPositionCreation]= useRecoilState<{ [key: string]: any }>(dataStore['Position Creation']);
  const [folderBrowser, setFolderBrowser] = useRecoilState<{ [key: string]: any }>(
    dataStore['Folder Browser']
  );
  const [permission, setPermission] = useRecoilState<{ [key: string]: any }>(dataStore.Permission);
  const [recordCreation, setRecordCreation] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record Creation']
  );
  const [hadRecordCreation, setHadRecordCreation] = useRecoilState<{ [key: string]: any }>(
    dataStore['Had Record Creation']
  );
  const [recordList, setRecordList] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record List']
  );
  const [childRecordList, setChildRecordList] = useRecoilState<{ [key: string]: any }>(
    dataStore['Child Record List']
  );
  const [queryRecordList, setQueryRecordList] = useRecoilState<{ [key: string]: any }>(
    dataStore['Query Record List']
  );
  const [recordAuditDetail, setRecordAuditDetail] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record Audit Detail']
  );
  const [recordHistory, setRecordHistory] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record History']
  );
  const [recordHistoryLog, setRecordHistoryLog] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record History Log']
  );
  const [recordComparison, setRecordComparison] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record Comparison']
  );
  const [dataImport, setDataImport] = useRecoilState<{ [key: string]: any }>(
    dataStore['Data Import']
  );
  const [dataExport, setDataExport] = useRecoilState<{ [key: string]: any }>(
    dataStore['Data Export']
  );
  const [properties, setProperties] = useRecoilState<{ [key: string]: any }>(dataStore.Properties);
  const [mySubscriptions, setMySubscriptions] = useRecoilState<{ [key: string]: any }>(
    dataStore['My Subscriptions']
  );
  const [report, setReport] = useRecoilState<{ [key: string]: any }>(dataStore.Report);
  const [mySearch, setMySearch] = useRecoilState<{ [key: string]: any }>(dataStore['My Search']);
  const [searchForm, setSearchForm] = useRecoilState<{ [key: string]: any }>(
    dataStore['Search Form']
  );
  const [contentCreation, setContentCreation] = useRecoilState<{ [key: string]: any }>(
    dataStore['Content Creation']
  );
  const [rendition, setRendition] = useRecoilState<{ [key: string]: any }>(dataStore['Rendition']);
  const [autoLinkPage, setAutoLinkPage] = useRecoilState<{ [key: string]: any }>(
    dataStore['autolinkpage']
  );
  const [autoLinkDetailPage, setAutoLinkDetailPage] = useRecoilState<{ [key: string]: any }>(
    dataStore['AutolinkDetailpage']
  );
  const [version, setVersion] = useRecoilState<{ [key: string]: any }>(dataStore['Version']);
  const [barChart, setBarChart] = useRecoilState<{ [key: string]: any }>(dataStore['Bar Chart']);
  const [myInbox, setMyInbox] = useRecoilState<{ [key: string]: any }>(dataStore['My Inbox']);
  const [myOutbox, setMyOutbox] = useRecoilState<{ [key: string]: any }>(dataStore['My Outbox']);
  const [taskDetail, setTaskDetail] = useRecoilState<{ [key: string]: any }>(
    dataStore['Task Detail']
  );
  const [taskComment, setTaskComment] = useRecoilState<{ [key: string]: any }>(
    dataStore['Task Comment']
  );
  const [gis, setGIS] = useRecoilState<{ [key: string]: any }>(dataStore['GIS']);
  const [emailEditor, setEmailEditor] = useRecoilState<{ [key: string]: any }>(
    dataStore['EmailEditor']
  );
  const [simpleSearch, setSimpleSearch] = useRecoilState<{ [key: string]: any }>(
    dataStore['Simple Search']
  );
  const [recordEditData, setRecordEditData] = useRecoilState<{ [key: string]: any }>(
    dataStore['Record Edit Data']
  );
  const [hadRecordList, setHadRecordList] = useRecoilState<{ [key: string]: any }>(
    dataStore['HAD Record List']
  );
  const [hadViewChange, setHadViewChange] = useRecoilState<{ [key: string]: any }>(
    dataStore['HAD View Change']
  );
  
  const [Publication, setPublication] = useRecoilState<{ [key: string]: any }>(
    dataStore['Publication']
  );

  const ResetMember = useResetRecoilState(dataStore.Member);
  const ResetOrgChart = useResetRecoilState(dataStore['Org Chart']);
  const ResetFolderBrowser = useResetRecoilState(dataStore['Folder Browser']);
  const ResetPermission = useResetRecoilState(dataStore.Permission);
  const ResetRecordCreation = useResetRecoilState(dataStore['Record Creation']);
  const ResetHadRecordCreation = useResetRecoilState(dataStore['Had Record Creation']);
  const ResetRecordList = useResetRecoilState(dataStore['Record List']);
  const ResetChildRecordList = useResetRecoilState(dataStore['Child Record List']);
  const ResetQueryRecordList = useResetRecoilState(dataStore['Query Record List']);
  const ResetRecordAuditDetail = useResetRecoilState(dataStore['Record Audit Detail']);
  const ResetRecordHistory = useResetRecoilState(dataStore['Record History']);
  const ResetRecordHistoryLog = useResetRecoilState(dataStore['Record History Log']);
  const ResetRecordComparison = useResetRecoilState(dataStore['Record Comparison']);
  const ResetDataImport = useResetRecoilState(dataStore['Data Import']);
  const ResetDataExport = useResetRecoilState(dataStore['Data Export']);
  const ResetProperties = useResetRecoilState(dataStore.Properties);
  const ResetMySubscriptions = useResetRecoilState(dataStore['My Subscriptions']);
  const ResetReport = useResetRecoilState(dataStore.Report);
  const ResetMySearch = useResetRecoilState(dataStore['My Search']);
  const ResetSearchForm = useResetRecoilState(dataStore['Search Form']);
  
  const ResetPositionCreation = useResetRecoilState(dataStore['Position Creation']);
  const ResetContentCreation = useResetRecoilState(dataStore['Content Creation']);
  const ResetRendition = useResetRecoilState(dataStore['Rendition']);
  const ResetAutoLinkPage = useResetRecoilState(dataStore['autolinkpage']);
  const ResetAutoLinkDetailPage = useResetRecoilState(dataStore['AutolinkDetailpage']);
  const ResetVersion = useResetRecoilState(dataStore['Version']);
  const ResetBarChart = useResetRecoilState(dataStore['Bar Chart']);
  const ResetMyInbox = useResetRecoilState(dataStore['My Inbox']);
  const ResetMyOutbox = useResetRecoilState(dataStore['My Outbox']);
  const ResetTaskDetail = useResetRecoilState(dataStore['Task Detail']);
  const ResetTaskComment = useResetRecoilState(dataStore['Task Comment']);
  const ResetGis = useResetRecoilState(dataStore['GIS']);
  const ResetEmailEditor = useResetRecoilState(dataStore['EmailEditor']);
  const ResetSimpleSearch = useResetRecoilState(dataStore['Simple Search']);
  const ResetRecordEditData = useResetRecoilState(dataStore['Record Edit Data']);
  const ResetHadRecordList = useResetRecoilState(dataStore['HAD Record List']);
  const ResetHadViewChange = useResetRecoilState(dataStore['HAD View Change']);
  

  const ResetPublication = useResetRecoilState(dataStore['Publication']);

  const store = {
    data: {
      Member: member,
      'Position Creation':postitionCreation,
      'Org Chart': orgChart,
      'Folder Browser': folderBrowser,
      Permission: permission,
      'Record Creation': recordCreation,
      'Had Record Creation': hadRecordCreation,
      'Record List': recordList,
      'Child Record List': childRecordList,
      'Query Record List': queryRecordList,
      'Record Audit Detail': recordAuditDetail,
      'Record History': recordHistory,
      'Record History Log': recordHistoryLog,
      'Record Comparison': recordComparison,
      'Data Import': dataImport,
      'Data Export': dataExport,
      Properties: properties,
      'My Subscriptions': mySubscriptions,
      Report: report,
      'My Search': mySearch,
      'Search Form': searchForm,
      'Content Creation': contentCreation,
      Rendition: rendition,
      autolinkpage: autoLinkPage,
      AutolinkDetailpage: autoLinkDetailPage,
      Version: version,
      'Bar Chart': barChart,
      'My Inbox': myInbox,
      'My Outbox': myOutbox,
      'Task Detail': taskDetail,
      'Task Comment': taskComment,
      GIS: gis,
      EmailEditor: emailEditor,
      'Simple Search': simpleSearch,
      'Record Edit Data': recordEditData,
      'HAD Record List': hadRecordList,
      'HAD View Change': hadViewChange,
      'Publication': Publication,
    },
    set: {
      Member: setMember,
      'Position Creation':setPositionCreation,
      'Org Chart': setOrgChart,
      'Folder Browser': setFolderBrowser,
      Permission: setPermission,
      'Record Creation': setRecordCreation,
      'Had Record Creation': setHadRecordCreation,
      'Record List': setRecordList,
      'Child Record List': setChildRecordList,
      'Query Record List': setQueryRecordList,
      'Record Audit Detail': setRecordAuditDetail,
      'Record History': setRecordHistory,
      'Record History Log': setRecordHistoryLog,
      'Record Comparison': setRecordComparison,
      'Data Import': setDataImport,
      'Data Export': setDataExport,
      Properties: setProperties,
      'My Subscriptions': setMySubscriptions,
      Report: setReport,
      'My Search': setMySearch,
      'Search Form': setSearchForm,
      'Content Creation': setContentCreation,
      Rendition: setRendition,
      autolinkpage: setAutoLinkPage,
      AutolinkDetailpage: setAutoLinkDetailPage,
      Version: setVersion,
      'Bar Chart': setBarChart,
      'My Inbox': setMyInbox,
      'My Outbox': setMyOutbox,
      'Task Detail': setTaskDetail,
      'Task Comment': setTaskComment,
      GIS: setGIS,
      EmailEditor: setEmailEditor,
      'Simple Search': setSimpleSearch,
      'Record Edit Data': setRecordEditData,
      'HAD Record List': setHadRecordList,
      'HAD View Change': setHadViewChange,
      'Publication': setPublication,
    },
    reset: () => {
      ResetPositionCreation();
      ResetMember();
      ResetOrgChart();
      ResetFolderBrowser();
      ResetPermission();
      ResetRecordCreation();
      ResetHadRecordCreation();
      ResetRecordList();
      ResetChildRecordList();
      ResetQueryRecordList();
      ResetRecordAuditDetail();
      ResetRecordHistory();
      ResetRecordHistoryLog();
      ResetRecordComparison();
      ResetDataImport();
      ResetDataExport();
      ResetProperties();
      ResetMySubscriptions();
      ResetReport();
      ResetMySearch();
      ResetSearchForm();
      ResetContentCreation();
      ResetRendition();
      ResetAutoLinkPage();
      ResetAutoLinkDetailPage();
      ResetVersion();
      ResetBarChart();
      ResetMyInbox();
      ResetMyOutbox();
      ResetTaskDetail();
      ResetTaskComment();
      ResetGis();
      ResetEmailEditor();
      ResetSimpleSearch();
      ResetRecordEditData();
      ResetHadRecordList();
      ResetHadViewChange();
      ResetPublication();
    },
  };
  return {
    store,
    data: key ? store.data[key] : {},
    set: key ? store.set[key] : () => {},
  };
};

export default useStore;
