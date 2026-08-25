import React, { useState } from "react";
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Grid } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/constants/queryKeys";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { clearUser } = useAuth();
  const queryClient = useQueryClient();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const handleLogout = () => {
    clearUser();
    queryClient.removeQueries({ queryKey: userKeys.all });
    navigate("/login");
  }

  const menuItems = [
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: "Products",
    },
    {
      key: "/admin/orders",
      icon: <OrderedListOutlined />,
      label: "Orders",
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Users",
    },
  ];

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Logout",
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="min-h-screen"  >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 80}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        className="shadow-md z-10"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <h1
            className={`font-bold text-xl text-[#ee4d2d] transition-all duration-300 whitespace-nowrap overflow-hidden ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            Admin Panel
          </h1>
          {collapsed && (
            <span className="text-[#ee4d2d] font-bold text-xl">AP</span>
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["/admin/products"]}
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-none mt-2"
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            height: screens.xs ? 56 : 64,
          }}
          className="flex justify-between items-center px-4 shadow-sm z-10"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: screens.xs ? "14px" : "16px",
              width: screens.xs ? 56 : 64,
              height: screens.xs ? 56 : 64,
            }}
          />
          <div className="mr-4">
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <Avatar icon={<UserOutlined />} className="bg-[#ee4d2d]" />
                {!screens.xs && <span className="font-medium">Admin</span>}
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: screens.xs ? "12px 8px" : "24px 16px",
            padding: screens.xs ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
