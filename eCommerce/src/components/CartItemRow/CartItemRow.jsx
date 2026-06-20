import React, { useState, useEffect, useRef } from "react";
import { Checkbox, InputNumber, Button, Image, Grid } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCartItem } from "../../apis/cart.api";
import { cartKeys } from "@/constants/queryKeys";

const { useBreakpoint } = Grid;

const CartItemRow = ({ item, isSelected, onSelect, onDelete }) => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const previousQuantityRef = useRef(item.quantity);

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem({ itemId, quantity }),
    onSuccess: () => {
      previousQuantityRef.current = localQuantity;
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update quantity");

      setLocalQuantity(previousQuantityRef.current);
    },
  });

  useEffect(() => {
    setLocalQuantity(item.quantity);
    previousQuantityRef.current = item.quantity;
  }, [item.quantity]);

  const { mutate } = updateMutation;
  useEffect(() => {
    if (localQuantity !== previousQuantityRef.current && localQuantity >= 1) {
      const timer = setTimeout(() => {
        mutate({ itemId: item.id, quantity: String(localQuantity) });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [localQuantity, item.id, mutate]);

  const handleQuantityChange = (value) => {
    if (value && value >= 1) {
      setLocalQuantity(value);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-sm shadow-sm items-center">
      <div className="col-span-12 md:col-span-6 flex items-center gap-2 md:gap-4">
        <Checkbox checked={isSelected} onChange={() => onSelect(item.id)} />
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src={item.productImageUrl}
            alt={item.productName}
            width={screens.md ? 240 : 200}
            className="object-cover border border-gray-200"
          />
          <Link
            to={`/products/${item.productId}`}
            className="text-gray-800 hover:text-[#ee4d2d] line-clamp-1 sm:line-clamp-2"
            title={item.productName}
          >
            {item.productName}
          </Link>
        </div>
      </div>

      <div className="col-span-4 md:col-span-2 text-left md:text-center">
        <span className="text-gray-500 text-xs md:text-base">
          {!screens.md && (
            <span className="block text-gray-400">Unit Price</span>
          )}
          ₹{item.productPrice.toLocaleString()}
        </span>
      </div>

      <div className="col-span-2 md:col-span-2 flex justify-center">
        <InputNumber
          min={1}
          max={item.stockQuantity} 
          size={screens.md ? "middle" : "small"}
          value={localQuantity}
          onChange={handleQuantityChange}
          disabled={updateMutation.isPending}
          className="w-full md:w-20"
        />
      </div>

      <div className="hidden md:block col-span-1 text-center">
        <span className="text-[#ee4d2d] font-medium">
          ₹{(item.productPrice * localQuantity).toLocaleString()}
        </span>
      </div>

      <div className="col-span-6 md:col-span-1 text-right md:text-center">
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(item.id)}
          size={screens.md ? "middle" : "small"}
          disabled={updateMutation.isPending}
        >
          {screens.xl && "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default CartItemRow;
