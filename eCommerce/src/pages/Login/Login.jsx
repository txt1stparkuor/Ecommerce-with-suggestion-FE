import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Input, Button, Card, Typography, Grid } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import backgroundImage from "../../assets/background.jpg";

import { login } from "../../apis/auth.api";
import { loginSchema } from "../../utils/loginValidation";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveUser } = useAuth();
  const screens = useBreakpoint();
  const inputSize = screens.md === false ? "middle" : "large";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (body) => login(body),
    onSuccess: (response) => {
      const authData = response.data;
      saveUser(authData);
      toast.success("Login successful!");
      const from = location.state?.from?.pathname;
      const userRole = authData?.authorities?.[0]?.authority;
      const defaultDashboard = userRole === "ADMIN" ? "/admin" : "/";
      if (from) {
        if (userRole !== "ADMIN" && from.startsWith("/admin")) {
          navigate(defaultDashboard, { replace: true });
          return;
        }
        navigate(from, { replace: true });
      } else {
        navigate(defaultDashboard, { replace: true });
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-6 text-center">
          <Title level={2}>Login</Title>
          <Text type="secondary">Welcome back!</Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="username"
                  autoComplete="username"
                  prefix={<UserOutlined />}
                  placeholder="Enter your username"
                  status={errors.username ? "error" : ""}
                  size={inputSize}
                />
              )}
            />
            {errors.username && (
              <span className="text-xs text-red-500">
                {errors.username.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="password"
                  autoComplete="current-password"
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  status={errors.password ? "error" : ""}
                  size={inputSize}
                />
              )}
            />
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
                Forgot password?
              </Link>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loginMutation.isPending}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500"
            size={inputSize}
          >
            Login
          </Button>

          <div className="mt-4 text-center">
            <Text>Don't have an account? </Text>
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
