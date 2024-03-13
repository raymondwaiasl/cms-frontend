import { childrenData, FindAllOrgChartResponse } from '../../../api';
import { useWidget } from '../../../hooks';
import TreeItem from '../../atom/TreeItem/TreeItem';
import styles from './GroupView.module.scss';
import { TreeView } from '@mui/lab';
import { Box, Paper, SvgIconProps } from '@mui/material';
import { useApi } from 'libs/common/src/lib/hooks';
import React from 'react';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { CgOrganisation } from 'react-icons/cg';
import { FiUser } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { RiOrganizationChart } from 'react-icons/ri';
import { useQuery } from 'react-query';

console.log(styles);
const levelIcon: { [key: string]: React.ElementType<SvgIconProps> } = {
  root: CgOrganisation,
  '2': RiOrganizationChart,
  '3': HiUserGroup,
  '4': FiUser,
};

const GroupView = () => {
  const client = useApi();
  const { updateWidget } = useWidget('Org Chart');
  const { data: orgChart } = useQuery('Org Chart', async () => {
    const { data } = await client.userService.findOrgChart();
    return data;
  });

  const renderTree = (items: childrenData[], level: number) => {
    return items.map((item) => (
      <TreeItem
        key={item.id as string}
        nodeId={item.id as string}
        labelText={item.name as string}
        labelIcon={levelIcon[item.level]}
        level={level + 1}
        onClick={() => {
          const payload = { nodeId: item.id, level: item.level };
          updateWidget('Member', payload);
        }}
      >
        {Array.isArray(item.children) && renderTree(item.children, level + 1)}
      </TreeItem>
    ));
  };

  return (
    <>
      {orgChart?.length != 0 ? (
        <TreeView
          aria-label="file system navigator"
          defaultExpanded={Array.isArray(orgChart) && orgChart[0].id ? [orgChart[0].id] : []}
          defaultExpandIcon={<BsChevronRight />}
          defaultCollapseIcon={<BsChevronDown />}
          className={styles.treeView}
        >
          {orgChart && renderTree(orgChart, 1)}
        </TreeView>
      ) : (
        <Paper
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ mt: 1 }}>No Data</Box>
        </Paper>
      )}
    </>
  );
};
export type GroupViewProps = {
  orgChart?: FindAllOrgChartResponse;
};
export default GroupView;
