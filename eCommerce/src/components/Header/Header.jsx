import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingOutlined, UserOutlined, LogoutOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Input, Button, Popover, Avatar, Badge } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useAuth from '../../hooks/useAuth'
import { getCurrentUser } from '../../apis/user.api'
import { getCart } from '../../apis/cart.api'
import { cartKeys, userKeys } from '@/constants/queryKeys'

const Header = () => {
  const { isAuthenticated, user, clearUser, setUserInfo } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const { data: userData } = useQuery({
    queryKey: userKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: isAuthenticated && !user?.username,
  })

  const { data: cartData } = useQuery({
    queryKey: cartKeys.all,
    queryFn: getCart,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (isAuthenticated && userData?.data && !user?.username) {
      setUserInfo(userData.data)
    }
  }, [userData, setUserInfo, user?.username, isAuthenticated])

  const handleLogout = () => {
    clearUser()
    queryClient.removeQueries({ queryKey: userKeys.all })
    queryClient.removeQueries({ queryKey: cartKeys.all })
  }

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword.trim()}`)
    }
  }

  const userContent = (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <Link to="/user/account" className="text-gray-700 hover:text-[#ee4d2d] py-1">
        My Account
      </Link>
      <Link to="/my-orders" className="text-gray-700 hover:text-[#ee4d2d] py-1">
        My Orders
      </Link>
      <Button
        type="text"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        className="text-left p-0 hover:text-[#ee4d2d] flex items-center"
      >
        Logout
      </Button>
    </div>
  )

  return (
    <header className="bg-gradient-to-b from-[#f53d2d] to-[#f63] py-3 md:py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="hidden md:flex items-center gap-2 text-white no-underline hover:text-white">
          <ShoppingOutlined className="text-4xl" />
          <span className="text-3xl font-bold">Shopping</span>
        </Link>

        <div className="mx-2 md:mx-8 flex-1 max-w-3xl">
          <div className="flex bg-white rounded-sm p-1">
            <Input
              className="border-none shadow-none focus:shadow-none"
              placeholder="Sign up and get 100% off on your first order"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button
              type="text"
              className="flex items-center justify-center border-none rounded-sm px-2 text-[#fb5533] hover:bg-transparent md:bg-[#fb5533] md:hover:bg-[#fb5533] md:px-6 md:text-white md:hover:text-white shadow-none"
              onClick={handleSearch}
            >
              <SearchOutlined className="text-lg" />
            </Button>
          </div>
        </div>

        {/* Auth Links */}
        <div className="flex items-center gap-2 md:gap-4 text-white">
          <Link to="/cart" className="text-white hover:text-gray-200 flex items-center">
            <Badge count={cartData?.data?.items?.length || 0} size="small" offset={[0, 0]}>
              <ShoppingCartOutlined className="text-2xl text-white" />
            </Badge>
          </Link>

          {isAuthenticated ? (
            <Popover content={userContent} trigger="hover" placement="bottomRight">
              <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} src={user?.avatar} className="bg-gray-200 text-gray-500" />
                <span className="font-medium max-w-[80px] md:max-w-[120px] truncate">{user?.username || user?.fullName || 'User'}</span>
              </div>
            </Popover>
          ) : (
            <div className="flex gap-3 font-medium text-sm">
              <Link to="/register" className="text-white hover:text-gray-200">Register</Link>
              <div className="w-[1px] bg-white/40"></div>
              <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
