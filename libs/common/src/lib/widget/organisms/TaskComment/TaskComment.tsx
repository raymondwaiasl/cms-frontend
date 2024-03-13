import { TaskCommentDto, SaveTaskCommentInput } from '../../../api/myInboxList';
import { useApi, useWidget } from '../../../hooks';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  if (name.indexOf(' ') > -1) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  } else {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.substring(0, 1)}`,
    };
  }
}

const TaskComment = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { data } = useWidget<{ workflowId: string; workflowActivityId: string; userId: string }>(
    'Task Comment'
  );
  const [workflowId, setWorkflowId] = useState<string>('');
  const [workflowActivityId, setWorkflowActivityId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [commentContent, setCommentContent] = useState<string>('');

  useEffect(() => {
    if (data?.workflowId) {
      setWorkflowId(data.workflowId);
      setWorkflowActivityId(data.workflowActivityId);
      setUserId(data.userId);
      setCommentContent('');
    }
  }, [data?.workflowId]);

  const { data: taskCommentList } = useQuery(['Task Comment', workflowId], async () => {
    const { data: commentList } = await client.myInbox.getCommentByWorkflowId({
      id: data?.workflowId ?? '',
    });
    console.log('Task Comment===', commentList);
    return commentList;
  });

  const saveTaskComment = useMutation(
    (data: SaveTaskCommentInput) => client.myInbox.saveTaskComment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('Task Comment');
      },
    }
  );

  const handleSend = () => {
    saveTaskComment.mutate({
      workflowId: workflowId,
      workflowActivityId: workflowActivityId,
      userId: userId,
      comment: commentContent,
    });
    // setCommentContent('');
  };

  return (
    <>
      {/* {taskCommentList?.length != 0 && ( */}

      <List sx={{ width: '100%', minWidth: 360, bgcolor: 'background.paper' }}>
        {taskCommentList?.map((item: TaskCommentDto) => (
          <>
            <ListItemText
              sx={{ textAlignLast: 'center' }}
              secondary={
                <React.Fragment>
                  {DateTime.fromMillis(item.wfCommentDate as unknown as number).toFormat(
                    'yyyy-MM-dd hh:mm:ss'
                  )}
                </React.Fragment>
              }
            />

            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar {...stringAvatar(item.wfCommentCommentator)} />
              </ListItemAvatar>
              <ListItemText
                primary={item.wfActivityName}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {item.wfCommentCommentator}
                    </Typography>
                    {' — '}
                    {item.wfCommentContent}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </>
        ))}
        <ListItem alignItems="flex-start">
          <Stack sx={{ width: '100%' }} direction="row" spacing={2}>
            <TextField
              sx={{ width: '100%' }}
              fullWidth
              label="Comment"
              id="taskComment"
              defaultValue=""
              value={commentContent}
              onChange={(evt) => setCommentContent(evt.target.value)}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={() => {
                handleSend();
                setCommentContent('');
              }}
            >
              Send
            </Button>
          </Stack>
        </ListItem>
      </List>
      {/* )} */}
    </>
  );
};

export default TaskComment;
