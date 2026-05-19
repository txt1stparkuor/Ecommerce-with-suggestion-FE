import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, Button, Typography, Divider, Skeleton } from "antd";
import toast from "react-hot-toast";
import { UserOutlined, MailOutlined } from "@ant-design/icons";

import { getCurrentUser, updateUser } from "../../apis/user.api";
import useAuth from "../../hooks/useAuth";
import { userKeys } from "@/constants/queryKeys";
import { profileSchema } from "@/utils/userValidation";

const { Title, Text } = Typography;

const Profile = () => {
  const queryClient = useQueryClient();
  const { setUserInfo } = useAuth();

  const { data: userData, isLoading } = useQuery({
    queryKey: userKeys.currentUser(),
    queryFn: getCurrentUser,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: "",
      fullName: "",
    },
  });

  useEffect(() => {
    if (userData?.data) {
      reset({
        username: userData.data.username,
        fullName: userData.data.fullName,
      });
    }
  }, [userData, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateUser(userData.data.id, data),
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      setUserInfo(response.data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <div>
      <div className="mb-4">
        <Title level={4}>My Profile</Title>
        <Text type="secondary">Manage and protect your account</Text>
      </div>
      <Divider />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
          <label className="text-gray-500 md:text-right pr-4">Email</label>
          <div className="md:col-span-2">
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              value={userData?.data?.email}
              disabled
              size="large"
              className="bg-gray-50 border-gray-200"
            />
            <Text type="secondary" className="text-xs italic mt-1 block">
              Email cannot be changed
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
          <label className="text-gray-500 md:text-right pr-4 pt-2">
            Username
          </label>
          <div className="md:col-span-2">
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  size="large"
                  status={errors.username ? "error" : ""}
                />
              )}
            />
            {errors.username && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.username.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
          <label className="text-gray-500 md:text-right pr-4 pt-2">
            Full Name
          </label>
          <div className="md:col-span-2">
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  status={errors.fullName ? "error" : ""}
                  placeholder="Enter your full name"
                />
              )}
            />
            {errors.fullName && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.fullName.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          <div className="hidden md:block"></div>
          <div className="md:col-span-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="px-8 bg-[#ee4d2d] border-none"
              loading={updateProfileMutation.isPending}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
