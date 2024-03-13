import { Button, Typography } from '@mui/material';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import React, { useMemo, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const ViewRelationData = () => {
  console.log('sssss====');
  const history = useHistory();
  const { search } = useLocation();
  const typeId = useMemo(() => new URLSearchParams(search).get('id'), [search]);
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
  const { data: welcomeData, isLoading } = useQuery(['useradmin'], async () => {
    const { data: response } = await client.recordManage.getRelationData({
      tableId: typeId ? typeId : '',
      recordId: '',
    });
    return response;
  });
  useEffect(() => {
    console.log('sssss====');
    const { data: welcomeData, isLoading } = useQuery(['useradmin'], async () => {
      const { data: response } = await client.recordManage.getRelationData({
        tableId: typeId ? typeId : '',
        recordId: '',
      });
      return response;
    });
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: welcomeData }}></div>
    </>
  );
};

export default ViewRelationData;
