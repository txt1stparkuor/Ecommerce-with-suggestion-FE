import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Button, Card, Typography, Result } from 'antd';
import { MdLock, MdRefresh } from 'react-icons/md';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { resetPassword } from "../../apis/auth.api";
import { resetPasswordSchema } from '../../utils/authValidation';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      toast.error('Invalid access. Missing reset token.');
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const resetPasswordMutation = useMutation({
    mutationFn: (body) => resetPassword(body),
    onSuccess: () => {
      toast.success('Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Invalid or expired reset token.';
      toast.error(message);
    },
  });

  const onFinish = async (values) => {
    if (!token) {
      toast.error('Invalid or missing token. Please request a new reset link.');
      return;
    }
    resetPasswordMutation.mutate({
      token: token,
      newPassword: values.newPassword
    });
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg rounded-xl text-center">
          <Result
            status="warning"
            title="Session Expired or Invalid Link"
            subTitle="The reset token is missing from the URL. Please request a new link."
            extra={
              <Button type="primary" size="large">
                <Link to="/forgot-password" className="flex items-center gap-2">
                  <MdRefresh /> Request New Link
                </Link>
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <div className="text-center mb-8">
          <Title level={2}>Reset Password</Title>
          <Text type="secondary" className="block mt-2">Enter your new secure password below.</Text>
        </div>

        <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <Input.Password 
                  {...field}
                  prefix={<MdLock className="text-gray-400 mr-2" />} 
                  placeholder="New password" 
                  size="large" 
                  status={errors.newPassword ? "error" : ""}
                  className="rounded-lg" 
                />
              )}
            />
            {errors.newPassword && (
              <span className="text-xs text-red-500">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <Controller
              name="confirmNewPassword"
              control={control}
              render={({ field }) => (
                <Input.Password 
                  {...field}
                  prefix={<MdLock className="text-gray-400 mr-2" />} 
                  placeholder="Confirm new password" 
                  size="large" 
                  status={errors.confirmNewPassword ? "error" : ""}
                  className="rounded-lg" 
                />
              )}
            />
            {errors.confirmNewPassword && (
              <span className="text-xs text-red-500">
                {errors.confirmNewPassword.message}
              </span>
            )}
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full h-12 text-lg font-medium rounded-lg mt-4" 
            loading={resetPasswordMutation.isPending}
          >
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;