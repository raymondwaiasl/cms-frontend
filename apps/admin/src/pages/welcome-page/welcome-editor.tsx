import { Button, Typography } from '@mui/material';
import { IDomEditor, IEditorConfig, IToolbarConfig, i18nChangeLanguage } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const WelcomeEditor = () => {
  const history = useHistory();
  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null); // TS 语法
  // const [editor, setEditor] = useState(null)                   // JS 语法

  // 编辑器内容
  const [html, setHtml] = useState('');

  // 模拟 ajax 请求，异步设置 html
  useEffect(() => {
    setTimeout(() => {
      setHtml('');
    }, 1500);
  }, []);

  const client = useApi();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ [key: string]: any }>({
    mode: 'onSubmit',
    defaultValues: {},
  });
  const toolbarConfig: Partial<IToolbarConfig> = {}; // TS 语法
  const editorConfig: any = { MENU_CONF: [] };
  type InsertFnType = (url: string, alt: string, href: string) => void;
  editorConfig.MENU_CONF['uploadImage'] = {
    // 单个文件的最大体积限制，默认为 2M
    maxFileSize: 1 * 1024 * 1024, // 1M
    // 最多可上传几个文件，默认为 100
    maxNumberOfFiles: 10,
    // 选择文件时的类型限制
    allowedFileTypes: [],
    // 跨域是否传递 cookie ，默认为 false
    withCredentials: true,
    // 超时时间，默认为 10 秒
    timeout: 5 * 1000, // 5 秒
    async customUpload(file: File, insertFn: InsertFnType) {
      // TS 语法
      // async customUpload(file, insertFn) {                   // JS 语法
      // file 即选中的文件
      // 自己实现上传，并得到图片 url alt href
      // 最后插入图片
      const formData = new FormData();
      formData.append('file', file);
      const { data: response } = await client.welcomePage.uploadEditorImage(formData);
      insertFn(response, '', '');
    },
  };

  const AddWelcomeData = useMutation(client.welcomePage.AddWelcomeData, {
    onSuccess: () => {
      toast('Update Successfully', {
        type: 'success',
      });
      reset({
        content: '',
      });
    },
    //history.push({pathname: route.activityCreate})
  });

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <>
      <Typography variant="h5"></Typography>
      <form
        onSubmit={handleSubmit((data) => {
          const content = html;
          AddWelcomeData.mutate({
            content: content,
          });
          //history.push({ pathname: route.activity });
        })}
      >
        <Controller
          name="content"
          control={control}
          render={({ field: { value } }) => (
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
              <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode="default"
                style={{ borderBottom: '1px solid #ccc' }}
              />
              <Editor
                defaultConfig={editorConfig}
                value={value}
                onCreated={setEditor}
                onChange={(editor) => setHtml(editor.getHtml())}
                mode="default"
                style={{ height: '500px', overflowY: 'hidden' }}
              />
            </div>
          )}
        />
        <Button variant="contained" type="submit">
          Create
        </Button>
        <Button
          onClick={() => {
            history.push({ pathname: route.welcomeConfig });
          }}
        >
          Cancel
        </Button>
      </form>
    </>
  );
};

export default WelcomeEditor;
