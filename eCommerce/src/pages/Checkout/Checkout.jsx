import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Input, Button, Image } from 'antd'
import toast from 'react-hot-toast'
import { createOrder } from '../../apis/order.api'
import { cartKeys, orderKeys } from '@/constants/queryKeys'

const { Title, Text } = Typography
const { TextArea } = Input
import { generateIdempotencyKey } from '@/utils/helperFunction'

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [shippingAddress, setShippingAddress] = useState('')
  const idempotencyKeyRef = useRef(generateIdempotencyKey())

  const checkoutItems = location.state?.items || []
  const totalPayment = checkoutItems.reduce(
    (total, item) => total + item.totalPrice,
    0,
  )

  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart')
    }
  }, [checkoutItems, navigate])

  const createOrderMutation = useMutation({
    mutationFn: (payload) => createOrder({ 
      data: payload, 
      idempotencyKey: idempotencyKeyRef.current 
    }),
    onSuccess: () => {
      toast.success('Order placed successfully')
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all }) 
      navigate('/')
    },
    onError: () => {
      toast.error('Failed to place order')
    },
  })

  const handlePlaceOrder = () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address')
      return
    }

    const cartItemIds = checkoutItems.map((item) => item.id)
    createOrderMutation.mutate({ shippingAddress, cartItemIds })
  }

  if (checkoutItems.length === 0) return null

  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <Title level={3} className="mb-6">
        Checkout
      </Title>

      <div className="bg-white p-6 rounded-sm shadow-sm mb-4">
        <div className="grid grid-cols-12 gap-4 text-gray-500 text-sm mb-4 border-b pb-4">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Unit Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Total Price</div>
        </div>

        <div className="flex flex-col gap-4">
          {checkoutItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 items-center"
            >
              <div className="col-span-6 flex items-center gap-4">
                <Image
                  src={item.productImageUrl}
                  alt={item.productName}
                  width={50}
                  height={50}
                  className="object-cover border border-gray-200"
                />
                <Text className="line-clamp-2" title={item.productName}>
                  {item.productName}
                </Text>
              </div>
              <div className="col-span-2 text-center">
                ₹{item.productPrice.toLocaleString()}
              </div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-center font-medium text-[#ee4d2d]">
                ₹{item.totalPrice.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4 text-[#ee4d2d]">
          <Title level={4} className="!mb-0 !text-[#ee4d2d]">
            Shipping Address
          </Title>
        </div>
        <TextArea
          rows={3}
          placeholder="Enter your shipping address"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
        />
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col items-end gap-4 sticky bottom-0 border-t border-gray-200">
        <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t pt-4 mt-2">
          <Text className="text-gray-500">Total Payment:</Text>
          <Text className="text-2xl font-bold text-[#ee4d2d]">
            ₹{totalPayment.toLocaleString()}
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          className="bg-[#ee4d2d] hover:bg-[#d73211] w-48 mt-4"
          onClick={handlePlaceOrder}
          loading={createOrderMutation.isPending}
        >
          Place Order
        </Button>
      </div>
    </div>
  )
}

export default Checkout
