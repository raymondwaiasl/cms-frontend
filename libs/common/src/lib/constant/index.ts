import { SvgIconProps } from '@mui/material';
import { CgOrganisation } from 'react-icons/cg';
import { FiUser } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { RiAdminFill } from 'react-icons/ri';

export const levelIcon: { [key: string]: React.ElementType<SvgIconProps> } = {
  root: CgOrganisation,
  '2': RiAdminFill,
  '3': HiUserGroup,
  '4': FiUser,
};

export const filePermission = {
  '7': 'DELETE',
  '5': 'WRITE',
  '3': 'READ',
  '0': 'NONE',
};

export const ConditionArr = [
  { key: '0', value: 'like' },
  { key: '1', value: '=' },
  { key: '2', value: '<=' },
  { key: '3', value: '>=' },
];

export const typeList = [
  { key: '0', value: 'Boolean', disabled: ['5', '6', '7'] },
  { key: '1', value: 'String', disabled: ['5', '6', '7'] },
  { key: '2', value: 'Integer', disabled: ['5', '6', '7'] },
  { key: '3', value: 'ID', disabled: ['5', '6', '7'] },
  { key: '4', value: 'Date', disabled: ['0', '1', '2', '3', '4'] },
  { key: '5', value: 'Double', disabled: ['5', '6', '7'] },
  { key: '6', value: 'Text', disabled: ['5', '6', '7'] },
];

export const inputTypeList = [
  { key: '0', value: 'Sequence' },
  { key: '1', value: 'Text box' },
  { key: '2', value: 'Combo Box' },
  { key: '3', value: 'Check box' },
  { key: '4', value: 'Radio button' },
  { key: '5', value: 'System generated Date Time' },
  { key: '6', value: 'Date Picker' },
  { key: '7', value: 'Date Input' },
  { key: '8', value: 'Text Area' },
  { key: '9', value: 'Email Editor' },
  { key: '10', value: 'Compute Field' },
  { key: '11', value: 'Query Text Box' },
  { key: '12', value: 'Repeating Field' },
  { key: '13', value: 'Hyperlink' },
  { key: '14', value: 'Folder Picker' },
];

export const operatorList = [
  { key: '+', value: '+' },
  { key: '-', value: '-' },
  { key: '*', value: '*' },
  { key: '/', value: '/' },
];

export const GraphicsTypeData = [
  { key: '1', value: 'Bar Chart', code: 'bar' },
  { key: '2', value: 'Line Chart', code: 'line' },
  { key: '3', value: 'Pie Chart', code: 'pie' },
  { key: '4', value: 'Bar Race', code: 'bar' },
  { key: '5', value: 'Line Race', code: 'line' },
];

export const DefaultViewData = [
  { key: 'D', value: 'Data View' },
  { key: 'G', value: 'Graphics View' },
];

export const DefaultFolderId = '0015000000000001';

export const BiConfigType = [
  { key: 'defined_table', value: 'Defined Table' },
  { key: 'mis_workflow', value: 'Workflow' },
];

export const ColumnConfigConditionArr = [
  { key: 'EQ', value: 'is' },
  { key: 'GT', value: 'greater than' },
  { key: 'LT', value: 'less than' },
  { key: 'NE', value: 'not equals' },
  { key: 'PM', value: 'partial match' },
  { key: 'DL', value: 'later than' },
  { key: 'DE', value: 'less than' },
];

export const ColumnConfigType = [
  { key: '1', value: 'Basic Validation' },
  { key: '2', value: 'Conditional Mandatory' },
  { key: '3', value: 'Invisible Column' },
  { key: '4', value: 'Disable Column' },
];

export const linkOpeningWay = [
  { key: '1', value: 'New Window' },
  { key: '2', value: 'New Tab' },
  { key: '3', value: 'Current Window' },
];

export const LockLevel = [
  { key: 'p', value: 'Page' },
  { key: 's', value: 'Section' },
  { key: 'c', value: 'Column' },
];

export const simpleSearchItemType = [
  { key: '0', value: 'Label' },
  { key: '1', value: 'Text box' },
  { key: '2', value: 'Combo Box' },
  { key: '3', value: 'Check box' },
  { key: '4', value: 'Radio button' },
  { key: '5', value: 'System generated Date Time' },
  { key: '6', value: 'Date Picker' },
  { key: '7', value: 'Date Input' },
  { key: '8', value: 'Text Area' },
  { key: '9', value: 'Email Editor' },
  { key: '10', value: 'Empty Area' },
];
