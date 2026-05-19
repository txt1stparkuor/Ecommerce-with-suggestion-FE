import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Tag, Button, Space, Modal, Select, Descriptions, Image, Input } from 'antd'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAllOrders, updateOrderStatus, getOrderById } from '../../../apis/order.api'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import useDebounce from '../../../hooks/useDebounce'
import { orderKeys } from '@/constants/queryKeys'

const { Title, Text } = Typography
const { Search } = Input

const OrderManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const keyword = searchParams.get('keyword') || ''
  const page = Number(searchParams.get('page')) || 1
  const pageSize = 10

  useEffect(() => {
    if (debouncedSearchTerm !== keyword) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        if (debouncedSearchTerm) {
          newParams.set('keyword', debouncedSearchTerm)
        } else {
          newParams.delete('keyword')
        }
        newParams.set('page', 1)
        return newParams
      })
    }
  }, [debouncedSearchTerm, keyword, setSearchParams])

  const { data: ordersData, isLoading } = useQuery({
    queryKey: orderKeys.list({ keyword, page, pageSize }),
    queryFn: () => getAllOrders({ keyword, pageNum: page, pageSize }),
    keepPreviousData: true,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      toast.success('Order status updated successfully')
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      setIsUpdateModalOpen(false)
      setSelectedOrder(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status')
    },
  })

  const handleTableChange = (pagination) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', pagination.current)
    setSearchParams(newParams)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleOpenUpdateModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsUpdateModalOpen(true)
  }

  const handleCancelUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setSelectedOrder(null)
  }

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus })
    }
  }

  const handleViewDetails = async (orderId) => {
    try {
      const res = await getOrderById(orderId)
      const order = res.data
      Modal.info({
        title: 'Order Details',
        width: '70%',
        content: (
          <div className="mt-4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Order Code">{order.orderCode}</Descriptions.Item>
              <Descriptions.Item label="Order Date">{new Date(order.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Shipping Address">{order.shippingAddress}</Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong className="text-[#ee4d2d]">
                  ₹{order.totalAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusTagColor(order.status)}>{order.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Title level={5} className="mt-6 mb-4">
              Items
            </Title>
            <div className="flex flex-col gap-4 max-h-64 overflow-y-auto">
              {order.orderDetails.map((item) => (
                <div key={item.id} className="flex gap-4 items-center border-b pb-2">
                  <Image src={item.productImageUrl} width={60} height={60} className="object-cover" />
                  <div className="flex-1">
                    <Text>{item.productName}</Text>
                    <Text type="secondary" className="block">
                      Qty: {item.quantity} | Price: ₹{item.price.toLocaleString()}
                    </Text>
                  </div>
                  <Text strong>₹{item.totalPrice.toLocaleString()}</Text>
                </div>
              ))}
            </div>
          </div>
        ),
        onOk() {},
      })
    } catch (error) {
      toast.error('Failed to fetch order details')
    }
  }

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'PENDING': return 'gold'
      case 'PROCESSING': return 'processing'
      case 'SHIPPED': return 'cyan'
      case 'DELIVERED': return 'success'
      case 'CANCELLED': return 'error'
      default: return 'default'
    }
  }

  const columns = [
    { title: 'Order Code', dataIndex: 'orderCode', key: 'orderCode' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (amount) => `₹${amount.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag> },
    { title: 'Shipping Address', dataIndex: 'shippingAddress', key: 'shippingAddress', ellipsis: true },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)} />
          <Button icon={<EditOutlined />} onClick={() => handleOpenUpdateModal(record)} />
        </Space>
      ),
    },
  ]

  const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  return (
    <div>
      <Title level={2}>Order Management</Title>
      <div className="mb-4">
        <Search
          placeholder="Search by order code"
          allowClear
          size="large"
          onChange={handleSearchChange}
          value={searchTerm}
          className="max-w-md"
        />
      </div>
      <Table
        columns={columns}
        dataSource={ordersData?.data?.items || []}
        rowKey="id"
        pagination={{ current: page, pageSize, total: ordersData?.data?.meta?.totalElements || 0, showSizeChanger: false }}
        loading={isLoading}
        onChange={handleTableChange}
        className="mt-4"
      />
      <Modal title="Update Order Status" open={isUpdateModalOpen} onOk={handleUpdateStatus} onCancel={handleCancelUpdateModal} confirmLoading={updateStatusMutation.isPending}>
        {selectedOrder && (
          <Space direction="vertical" className="w-full">
            <Text>Order Code: <strong>{selectedOrder.orderCode}</strong></Text>
            <Text>Current Status: <Tag color={getStatusTagColor(selectedOrder.status)}>{selectedOrder.status}</Tag></Text>
            <Select value={newStatus} onChange={(value) => setNewStatus(value)} className="w-full">
              {orderStatuses.map((status) => (<Select.Option key={status} value={status}>{status}</Select.Option>))}
            </Select>
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default OrderManagement