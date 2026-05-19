import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { Input, Button, Typography, Divider } from 'antd';
import toast from 'react-hot-toast';
import { LockOutlined } from '@ant-design/icons';

import { changePassword } from '../../apis/auth.api';
import { changePasswordSchema } from '../../utils/authValidation';

const { Title, Text } = Typography;

const ChangePassword = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePassword(data),
    onSuccess: (response) => {
        toast.success(response.data || 'Password changed successfully!');
        reset();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    const { oldPassword, newPassword } = data;
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4}>Change Password</Title>
        <Text type="secondary">For your account's security, please do not share your password with others</Text>
      </div>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
          <label className="text-gray-500 md:text-right pr-4 pt-2">Current Password</label>
          <div className="md:col-span-2">
            <Controller
              name="oldPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} prefix={<LockOutlined />} size="large" status={errors.oldPassword ? 'error' : ''} placeholder="Current Password" />
              )}
            />
            {errors.oldPassword && <span className="text-xs text-red-500 mt-1 block">{errors.oldPassword.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
          <label className="text-gray-500 md:text-right pr-4 pt-2">New Password</label>
          <div className="md:col-span-2">
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} prefix={<LockOutlined />} size="large" status={errors.newPassword ? 'error' : ''} placeholder="New Password" />
              )}
            />
            {errors.newPassword && <span className="text-xs text-red-500 mt-1 block">{errors.newPassword.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
          <label className="text-gray-500 md:text-right pr-4 pt-2">Confirm Password</label>
          <div className="md:col-span-2">
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} prefix={<LockOutlined />} size="large" status={errors.confirmPassword ? 'error' : ''} placeholder="Confirm Password" />
              )}
            />
            {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          <div className="hidden md:block"></div>
          <div className="md:col-span-2">
            <Button type="primary" htmlType="submit" size="large" className="px-8 bg-[#ee4d2d] border-none hover:bg-[#d73211]" loading={changePasswordMutation.isPending}>
              Confirm
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
