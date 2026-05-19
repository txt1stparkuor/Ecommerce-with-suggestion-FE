import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Button, Card, Typography } from 'antd';
import { MdEmail, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { forgotPassword } from "../../apis/auth.api";
import { forgotPasswordSchema } from '../../utils/authValidation';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [countdown, setCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const forgotPasswordMutation = useMutation({
    mutationFn: (body) => forgotPassword(body),
    onSuccess: () => {
      toast.success('If an account with that email exists, a password reset link has been sent.');
      setCountdown(30);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send reset link.';
      toast.error(message);
    },
  });

  const onFinish = async (values) => {
    forgotPasswordMutation.mutate(values);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <div className="text-center mb-8">
          <Title level={2}>Forgot Password</Title>
          <Text type="secondary" className="block mt-2 text-base">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </div>

        <form onSubmit={handleSubmit(onFinish)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field}
                  id="email"
                  prefix={<MdEmail className="text-gray-400 mr-2" />} 
                  placeholder="user@example.com" 
                  size="large"
                  status={errors.email ? "error" : ""}
                  className="rounded-lg"
                />
              )}
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full h-12 text-lg font-medium rounded-lg mt-4" 
            loading={forgotPasswordMutation.isPending}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
            <MdArrowBack /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;