import React from 'react';
import { Menu, Avatar, Typography } from 'antd';
import { UserOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const { Text } = Typography;

const MyAccount = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/user/account/profile',
      icon: <UserOutlined className="text-blue-500" />,
      label: 'My Profile',
    },
    {
      key: '/user/account/password',
      icon: <LockOutlined className="text-orange-500" />,
      label: 'Change Password',
    },
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar Section */}
          <div className="w-full md:w-52 flex-shrink-0">
            {/* User Info Header */}
            <div className="flex items-center gap-3 py-3 px-1 mb-2">
              <Avatar 
                size={50} 
                icon={<UserOutlined />} 
                src={user?.avatar} 
                className="border border-gray-200 flex-shrink-0"
              />
              <div className="flex flex-col overflow-hidden justify-center">
                <Text strong className="truncate text-sm font-bold">
                  {user?.username || 'Username'}
                </Text>
                <div className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer hover:text-[#ee4d2d] transition-colors">
                  <EditOutlined />
                  <span onClick={() => navigate('profile')}>Edit Profile</span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              className="border-none bg-transparent"
              style={{ borderRight: 'none' }}
            />
          </div>

          {/* Main Content Area (renders Profile/Password pages) */}
          <div className="flex-1 bg-white rounded-sm shadow-sm min-h-[600px] p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;