import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Checkbox, InputNumber, Button, Typography, Image, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCart, updateCartItem, deleteCartItem } from '../../apis/cart.api'
import { cartKeys } from '@/constants/queryKeys'

const { Text, Title } = Typography

const Cart = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: cartKeys.all,
    queryFn: getCart,
  })

  const [selectedItems, setSelectedItems] = useState(new Set())

  const cartItems = data?.data?.items || []

  useEffect(() => {
    if (location.state?.selectedProductId && cartItems.length > 0) {
      const item = cartItems.find((i) => i.productId === location.state.selectedProductId)
      if (item) {
        setSelectedItems((prev) => new Set(prev).add(item.id))
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [cartItems, location.state, location.pathname, navigate])

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem({ itemId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
    onError: () => {
      toast.error('Failed to update quantity')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId) => deleteCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
      toast.success('Item removed')
    },
  })

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(Array.from(ids).map((id) => deleteCartItem(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
      setSelectedItems(new Set())
      toast.success('Selected items removed')
    },
  })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleQuantityChange = (value, itemId) => {
    if (value < 1) return
    updateMutation.mutate({ itemId, quantity: String(value) })
  }

  const handleDelete = (itemId) => {
    deleteMutation.mutate(itemId)
  }

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return
    deleteMultipleMutation.mutate(selectedItems)
  }

  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter((item) => selectedItems.has(item.id))
    navigate('/checkout', { state: { items: itemsToCheckout } })
  }

  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => selectedItems.has(item.id))

  const validSelectedCount = cartItems.filter((item) =>
    selectedItems.has(item.id),
  ).length

  const totalPayment = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + item.totalPrice, 0)
  }, [cartItems, selectedItems])

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Empty description="Your cart is empty" />
        <Link to="/products">
          <Button type="primary" className="mt-4 bg-[#ee4d2d]">
            Go Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <Title level={3} className="mb-6">
        Shopping Cart
      </Title>
      <div className="grid grid-cols-12 gap-4 bg-white p-4 rounded-sm shadow-sm mb-4 items-center text-gray-500 text-sm">
        <div className="col-span-6 flex items-center gap-4">
          <Checkbox checked={isAllSelected} onChange={handleSelectAll}/>
          <span className="text-black">Product</span>
        </div>
        <div className="col-span-2 text-center">Unit Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-1 text-center">Total Price</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-4 bg-white p-4 rounded-sm shadow-sm items-center"
          >
            <div className="col-span-6 flex items-center gap-4">
              <Checkbox
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
              <div className="flex items-center gap-4">
                <Image
                  src={item.productImageUrl}
                  alt={item.productName}
                  width={80}
                  height={80}
                  className="object-cover border border-gray-200"
                />
                <Link
                  to={`/products/${item.productId}`}
                  className="text-gray-800 hover:text-[#ee4d2d] line-clamp-2"
                  title={item.productName}
                >
                  {item.productName}
                </Link>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-gray-500">
                ₹{item.productPrice.toLocaleString()}
              </span>
            </div>
            <div className="col-span-2 flex justify-center">
              <InputNumber
                min={1}
                value={item.quantity}
                onChange={(value) => handleQuantityChange(value, item.id)}
                disabled={updateMutation.isPending}
                className="w-20"
              />
            </div>
            <div className="col-span-1 text-center">
              <span className="text-[#ee4d2d] font-medium">
                ₹{item.totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
              <span>Select All ({cartItems.length})</span>
            </div>
            <Button
              type="text"
              danger
              onClick={handleBulkDelete}
              disabled={selectedItems.size === 0}
            >
              Delete
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Total ({validSelectedCount} items):</span>
              <span className="text-2xl text-[#ee4d2d] font-medium">
                ₹{totalPayment.toLocaleString()}
              </span>
            </div>
            <Button
              type="primary"
              size="large"
              className="bg-[#ee4d2d] hover:bg-[#d73211] w-48"
              disabled={selectedItems.size === 0}
              onClick={handleCheckout}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart