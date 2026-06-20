import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Modal,
  Grid,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getUsers,
  deleteUser,
  createUser,
  updateUser,
  getUserById,
} from "../../../apis/user.api";
import useDebounce from "../../../hooks/useDebounce";
import UserForm from "../../../components/UserForm/UserForm";
import { userKeys } from "@/constants/queryKeys";

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const screens = useBreakpoint();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 5;

  useEffect(() => {
    if (debouncedSearchTerm !== keyword) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (debouncedSearchTerm) {
          newParams.set("keyword", debouncedSearchTerm);
        } else {
          newParams.delete("keyword");
        }
        newParams.set("page", 1);
        return newParams;
      });
    }
  }, [debouncedSearchTerm, keyword, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: userKeys.list({ keyword, page, pageSize }),
    queryFn: () => getUsers({ keyword, pageNum: page, pageSize }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (body) => createUser(body),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateUser(id, body),
    // FIX: Extracted `variables` parameter which contains `{ id, body }`
    onSuccess: (data, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      }); // Use variables.id here
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    // FIX: Extracted the `id` argument as the second parameter here
    onSuccess: (data, id) => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }); // Use the provided id here
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTableChange = (pagination) => {
    setSearchParams({
      keyword,
      page: pagination.current,
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = async (id) => {
    try {
      const res = await getUserById(id);
      setEditingUser(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  const handleViewUser = async (id) => {
    try {
      const res = await getUserById(id);
      Modal.info({
        title: "User Details",
        width: screens.md ? 600 : "95%",
        maskClosable: true,
        content: (
          <div>
            <p>
              <strong>Username:</strong> {res.data.username}
            </p>
            <p>
              <strong>Full Name:</strong> {res.data.fullName}
            </p>
            <p>
              <strong>Email:</strong> {res.data.email}
            </p>
            <p>
              <strong>Roles:</strong> {res.data.roles.join(", ")}
            </p>
          </div>
        ),
        onOk() {},
      });
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmitForm = (formData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      width: 150,
      render: (roles) => (
        <>
          {roles?.map((role) => (
            <Tag color={role === "ADMIN" ? "red" : "blue"} key={role}>
              {role}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: screens.md ? 160 : 130,
      render: (_, record) => (
        <Space size={screens.md ? "middle" : "small"}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record.id)}
            size={screens.md ? "middle" : "small"}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record.id)}
            size={screens.md ? "middle" : "small"}
          />
          <Popconfirm
            title="Delete the user"
            description="Are you sure to delete this user?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
              size={screens.md ? "middle" : "small"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Title level={screens.xs ? 4 : 2} style={{ margin: 0 }}>
          User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-[#ee4d2d] flex items-center"
          onClick={handleAddUser}
          size={screens.xs ? "middle" : "large"}
        >
          Add User
        </Button>
      </div>
      <div className="mb-4">
        <Search
          placeholder="Search by username, full name, email"
          allowClear
          size={screens.xs ? "middle" : "large"}
          onChange={handleSearchChange}
          value={searchTerm}
          className="w-full sm:max-w-md"
        />
      </div>
      <Table
        columns={columns}
        dataSource={data?.data?.items || []}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.data?.meta?.totalElements || 0,
          showSizeChanger: false,
        }}
        loading={isLoading}
        onChange={handleTableChange}
        scroll={{ x: 900 }}
        bordered
      />
      {isModalOpen && (
        <UserForm
          open={isModalOpen}
          onCancel={handleCancelModal}
          onSubmit={handleSubmitForm}
          initialValues={editingUser}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default UserManagement;
