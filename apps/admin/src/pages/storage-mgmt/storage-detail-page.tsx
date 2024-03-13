import {
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { AddStorageInput, StorageDetail, UpdateStorageInput } from 'libs/common/src/lib/api';
import { useApi } from 'libs/common/src/lib/hooks';
import { useMemo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { useQuery, useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const StorageDetailPage = () => {
  const client = useApi();
  const history = useHistory();
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);

  const [storageDetail, setStorageDetail] = useState<UpdateStorageInput>();
  // const [errorMsg, setErrorMsg] = useState('');

  const thresholds: any[] = [
    { key: 0.1, value: '10%' },
    { key: 0.2, value: '20%' },
    { key: 0.3, value: '30%' },
    { key: 0.4, value: '40%' },
    { key: 0.5, value: '50%' },
    { key: 0.6, value: '60%' },
  ];

  // react hook form
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      cmsStorageName: storageDetail?.cmsStorageName,
      cmsStoragePath: storageDetail?.cmsStoragePath,
      cmsStorageEncrypt: storageDetail?.cmsStorageEncrypt,
      cmsStorageThreshold: storageDetail?.cmsStorageThreshold,
    },
  });
  const UpdateStorage = useMutation(client.storage.updateStorage, {
    onSuccess: () => {
      history.push('/storage');
      toast('Update Successfully', {
        type: 'success',
      });
    },
  });
  const AddStorage = useMutation(client.storage.addStorage, {
    onSuccess: () => {
      history.push('/storage');
      toast('Add Successfully', {
        type: 'success',
      });
    },
  });
  const submitHandling = (data: any) => {
    if (paramId) {
      UpdateStorage.mutate({
        cmsStorageId: paramId,
        cmsStorageName: data.cmsStorageName,
        cmsStoragePath: data.cmsStoragePath,
        cmsStorageEncrypt: data.cmsStorageEncrypt,
        cmsStorageThreshold: data.cmsStorageThreshold,
      });
    } else {
      AddStorage.mutate({
        cmsStorageName: data.cmsStorageName,
        cmsStoragePath: data.cmsStoragePath,
        cmsStorageEncrypt: data.cmsStorageEncrypt,
        cmsStorageThreshold: data.cmsStorageThreshold,
      });
    }
  };
  useQuery(
    ['storage detail', paramId],
    async () => {
      const { data: response } = await client.storage.getStorageDetail({
        id: paramId ?? '',
      });
      return response;
    },
    {
      enabled: !!paramId,
      onSuccess(data) {
        console.log('data storage response========', data);
        setStorageDetail({
          cmsStorageId: data?.cmsStorageId,
          cmsStorageName: data?.cmsStorageName,
          cmsStoragePath: data?.cmsStoragePath,
          cmsStorageEncrypt: data?.cmsStorageEncrypt,
          cmsStorageThreshold: data?.cmsStorageThreshold,
        });
      },
    }
  );

  useEffect(() => {
    console.log('testtttttttttttt', storageDetail);
    if (storageDetail) {
      reset({
        cmsStorageName: storageDetail?.cmsStorageName,
        cmsStoragePath: storageDetail?.cmsStoragePath,
        cmsStorageEncrypt: storageDetail?.cmsStorageEncrypt,
        cmsStorageThreshold: storageDetail?.cmsStorageThreshold,
      });
    }
  }, [storageDetail]);

  return (
    <>
      <div>
        <Typography variant="h6">Storage Edit</Typography>
      </div>
      <form onSubmit={handleSubmit(submitHandling)}>
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="cmsStorageName"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <TextField
                focused={!!paramId}
                id="cmsStorageName"
                variant="standard"
                error={!!errors.cmsStorageName}
                onChange={onChange}
                value={value ?? storageDetail?.cmsStorageName}
                label="Name"
                helperText={errors?.cmsStorageName?.message as string}
              />
            )}
          />
        </Stack>
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="cmsStoragePath"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <TextField
                focused={!!paramId}
                id="cmsStoragePath"
                variant="standard"
                error={!!errors.cmsStoragePath}
                onChange={onChange}
                value={value ?? storageDetail?.cmsStoragePath}
                label="Location"
                helperText={errors?.cmsStoragePath?.message as string}
              />
            )}
          />
        </Stack>
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="cmsStorageEncrypt"
            defaultValue={'N'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                id="cmsStorageEncrypt"
                error={!!errors?.cmsStorageEncrypt}
                variant="standard"
                sx={{ width: '200px', display: 'flex', flexDirection: 'column', marginY: 2 }}
              >
                <Typography variant="caption">Encrypted</Typography>
                <FormControlLabel
                  checked={value === 'Y'}
                  onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                  control={<Checkbox />}
                  label={value === 'Y' ? 'Yes' : 'No'}
                />
              </FormControl>
            )}
          />
        </Stack>
        <Stack direction="row" spacing={2} mb={2}>
          {/* <Controller
            name="cmsStorageThreshold"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl
                // focused={!!paramId}
                variant="standard"
                sx={{ m: 1, minWidth: 200 }}
                error={!!errors.cmsStorageThreshold}
              >
                <InputLabel id="demo-simple-select-standard-label">Threshold</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={storageDetail?.cmsStorageThreshold as string}
                  onChange={onChange}
                // readOnly={!!paramId}
                >
                  {thresholds?.map((item) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>{errors?.cmsStorageThreshold?.message as string}</FormHelperText>
              </FormControl>
            )}
          /> */}
          <Controller
            name="cmsStorageThreshold"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl
                id="cmsStorageThreshold"
                focused={!!paramId}
                variant="standard"
                sx={{ width: '200px' }}
              >
                <InputLabel
                  id="cmsStorageThresholdSelectLabel"
                  error={!!errors.cmsStorageThreshold}
                >
                  Threshold
                </InputLabel>
                <Select
                  displayEmpty
                  renderValue={(newVal) =>
                    thresholds?.find((item) => item.key === newVal)?.value ??
                    thresholds?.find((item) => item.key === storageDetail?.cmsStorageThreshold)
                      ?.value
                  }
                  value={value ?? storageDetail?.cmsStorageThreshold}
                  defaultValue={storageDetail?.cmsStorageThreshold}
                  onChange={onChange}
                >
                  {thresholds.map((item) => (
                    <MenuItem key={item.key as string} value={item.key} sx={{ width: '200px' }}>
                      {item.value}
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.cmsStorageThreshold && (
                  <FormHelperText error>
                    {errors?.cmsStorageThreshold.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Stack>
        <Stack direction="row" spacing={2} mb={3} mt={3}>
          <Button disableElevation variant="contained" sx={{}} startIcon={<FaSave />} type="submit">
            Save
          </Button>
          <Button
            disableElevation
            variant="outlined"
            sx={{}}
            type="submit"
            onClick={() => history.goBack()}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default StorageDetailPage;
