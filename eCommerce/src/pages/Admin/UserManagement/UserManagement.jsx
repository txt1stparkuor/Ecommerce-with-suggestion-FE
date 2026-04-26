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

const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || ""
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 6;

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
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
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
    { title: "Username", dataIndex: "username", key: "username", width: "20%" },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: "25%",
    },
    { title: "Email", dataIndex: "email", key: "email", width: "25%" },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record.id)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record.id)}
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
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>User Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-[#ee4d2d]"
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>
      <div className="mb-4">
        <Search
          placeholder="Search by username, full name, email"
          allowClear
          size="large"
          onChange={handleSearchChange}
          value={searchTerm}
          className="max-w-md"
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
