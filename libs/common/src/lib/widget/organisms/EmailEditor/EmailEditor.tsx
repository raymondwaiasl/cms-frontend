import { useWidget } from '../../../hooks';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import EditorInstance from '@johnjaller/ckeditor5';
import { TextField, Box, FormLabel } from '@mui/material';
import { useState, useEffect } from 'react';

const EmailEditor = () => {
  const { data } = useWidget<{ en: string; tc: string; sc: string }>('EmailEditor');
  useEffect(() => {
    if (data) {
      setEmailData(data);
    }
  }, [data]);
  const [emailData, setEmailData] = useState({
    en: '',
    tc: '',
    sc: '',
  });
  return (
    <Box
      sx={{
        minHeight: '100%',
        maxHeight: '500px',
        padding: 2,
        marginTop: 2,
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        boxShadow: 'none',
        ['.ck-editor__editable']: {
          overflow: 'auto',
          maxHeight: '300px',
          minHeight: '200px',
        },
        ['.ck-sticky-panel__content']: {
          zIndex: 1,
        },
        ['.ck-dropdown__panel']: {
          maxWidth: '400px !important',
        },
      }}
    >
      <TextField
        label="Title (Traditional Chinese)"
        sx={{ marginBottom: '24px' }}
        inputProps={{ sx: { padding: '12px' } }}
      />
      <TextField
        label="Title (English)"
        sx={{ marginBottom: '24px' }}
        inputProps={{ sx: { padding: '12px' } }}
      />
      <TextField
        label="Title (Simpified Chinese)"
        sx={{ marginBottom: '24px' }}
        inputProps={{ sx: { padding: '12px' } }}
      />
      <FormLabel>Email Body (Traditional Chinese)</FormLabel>
      <CKEditor
        editor={EditorInstance}
        data={emailData.tc}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEmailData((prev) => ({ ...prev, tc: data }));
          console.log({ event, editor, data });
        }}
        onBlur={(_, editor) => {
          console.log('Blur.', editor);
        }}
        onFocus={(_, editor) => {
          console.log('Focus.', editor);
        }}
      />
      <FormLabel>Email Body (Simpified Chinese)</FormLabel>
      {/* <div dangerouslySetInnerHTML={{ __html: tcData }}></div> */}
      <CKEditor
        editor={EditorInstance}
        data={emailData.sc}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEmailData((prev) => ({ ...prev, sc: data }));
          console.log({ event, editor, data });
        }}
        onBlur={(_, editor) => {
          console.log('Blur.', editor);
        }}
        onFocus={(_, editor) => {
          console.log('Focus.', editor);
        }}
      />
      <FormLabel>Email Body (English)</FormLabel>
      <CKEditor
        editor={EditorInstance}
        data={emailData.en}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEmailData((prev) => ({ ...prev, en: data }));
          console.log({ event, editor, data });
        }}
        onBlur={(_, editor) => {
          console.log('Blur.', editor);
        }}
        onFocus={(_, editor) => {
          console.log('Focus.', editor);
        }}
      />
    </Box>
  );
};

export default EmailEditor;
