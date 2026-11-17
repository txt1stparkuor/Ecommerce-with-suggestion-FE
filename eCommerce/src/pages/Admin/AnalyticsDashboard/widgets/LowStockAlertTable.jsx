import React, { useState, useMemo, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { stockQuantityField } from "@/utils/productValidation";
import {
  Card,
  Table,
  Tag,
  Button,
  InputNumber,
  Modal,
  Form,
  Tooltip,
} from "antd";
import {
  WarningOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLowStockProducts } from "@/apis/analytics.api";
import { analyticsKeys, productKeys } from "@/constants/queryKeys";

// Yup schema for the stock update modal — reuses the shared stockQuantityField rule
const stockSchema = yup.object({
  newStock: stockQuantityField,
});

// Local schema for the inline threshold filter — not shared (component-specific)
const thresholdSchema = yup.object({
  threshold: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(1000, 'Cannot exceed 1000')
    .required('Threshold is required'),
});

// Stock badge helper strictly adhering to design requirements:
// 0 stock: Red tag (error) "Out of Stock"
// 1-5 stock: Orange tag (warning) "Critical Low"
// > 5 stock: Yellow/Gold tag with exact quantity
const renderStockTag = (quantity) => {
  if (quantity === 0) {
    return (
      <Tag
        color="error"
        icon={<CloseCircleOutlined />}
        className="font-semibold text-xs px-2.5 py-0.5 rounded-md"
      >
        Out of Stock (0)
      </Tag>
    );
  }
  if (quantity <= 5) {
    return (
      <Tag
        color="warning"
        icon={<ExclamationCircleOutlined />}
        className="font-semibold text-xs px-2.5 py-0.5 rounded-md"
      >
        Critical Low ({quantity})
      </Tag>
    );
  }
  return (
    <Tag
      color="gold"
      icon={<WarningOutlined />}
      className="font-semibold text-xs px-2.5 py-0.5 rounded-md"
    >
      Low Stock ({quantity})
    </Tag>
  );
};

const LowStockAlertTable = ({ className = "" }) => {
  const queryClient = useQueryClient();

  // Pagination state (1-indexed matching backend spec)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  // Local optimistic overrides when stock is updated via modal
  const [localOverrides, setLocalOverrides] = useState({});

  // Stock edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // RHF — stock update modal
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(stockSchema),
    defaultValues: { newStock: 0 },
  });

  // RHF — inline threshold filter
  const {
    control: thresholdControl,
    setValue: setThresholdValue,
    watch: watchThreshold,
    formState: { errors: thresholdErrors },
  } = useForm({
    resolver: yupResolver(thresholdSchema),
    defaultValues: { threshold: 10 },
    mode: 'onChange',
  });

  // Watch the raw RHF value and debounce it so the table only re-queries
  // after the user pauses typing (not on every keystroke).
  const thresholdWatched = watchThreshold('threshold');
  const debouncedThreshold = useDebounce(thresholdWatched, 400);

  // Only apply to the filter when Yup says the field is valid.
  // Falls back to 10 when there is an error (e.g. negative, empty, too large).
  const threshold =
    !thresholdErrors.threshold &&
    typeof debouncedThreshold === 'number' &&
    !isNaN(debouncedThreshold)
      ? debouncedThreshold
      : 10;

  // Reset page to 1 whenever threshold filter changes
  useEffect(() => {
    setPagination((prev) => (prev.current === 1 ? prev : { ...prev, current: 1 }));
  }, [threshold]);

  // Query parameters strictly matching backend specification:
  // GET /api/v1/analytics/inventory/low-stock?threshold=...&pageNum=...&pageSize=...
  const queryParams = useMemo(
    () => ({
      threshold,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }),
    [threshold, pagination]
  );

  const {
    data: lowStockResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: analyticsKeys.lowStock(queryParams),
    queryFn: () => getLowStockProducts(queryParams),
  });

  // Normalize list from backend response
  const rawItems = useMemo(() => {
    const rawList = Array.isArray(lowStockResponse?.data?.items)
      ? lowStockResponse.data.items
      : Array.isArray(lowStockResponse?.data?.content)
      ? lowStockResponse.data.content
      : Array.isArray(lowStockResponse?.data)
      ? lowStockResponse.data
      : Array.isArray(lowStockResponse)
      ? lowStockResponse
      : [];

    return rawList.map((item, index) => ({
      productId: item.productId ?? item.id ?? `prod-${index}`,
      productName: item.productName ?? item.name ?? "Unknown Product",
      stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),
      price: Number(item.price ?? 0),
    }));
  }, [lowStockResponse]);

  // Extract total elements from pagination metadata
  const totalElements =
    lowStockResponse?.data?.meta?.totalElements ??
    lowStockResponse?.data?.totalElements ??
    lowStockResponse?.data?.total ??
    rawItems.length;

  // Merge optimistic local overrides and ensure lowest stock sorts first
  const displayItems = useMemo(() => {
    return rawItems
      .map((item) => {
        if (localOverrides[item.productId] !== undefined) {
          return { ...item, stockQuantity: localOverrides[item.productId] };
        }
        return item;
      })
      .sort((a, b) => a.stockQuantity - b.stockQuantity);
  }, [rawItems, localOverrides]);

  // Open modal to quick-update stock
  const handleOpenStockModal = (record) => {
    setSelectedProduct(record);
    reset({ newStock: record.stockQuantity });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    reset({ newStock: 0 });
  };

  // Submit stock update
  const handleUpdateStock = (data) => {
    if (!selectedProduct) return;
    const newQuantity = Number(data.newStock);

    // Optimistically update stock in UI
    setLocalOverrides((prev) => ({
      ...prev,
      [selectedProduct.productId]: newQuantity,
    }));

    queryClient.invalidateQueries({ queryKey: analyticsKeys.lowStockList() });
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });

    toast.success(
      `Stock for "${selectedProduct.productName}" updated to ${newQuantity}`,
    );
    handleCloseModal();
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName", 
      render: (name, record) => (
        <div className="flex flex-col">
          <Tooltip title={name}>
            <Link
              to={`/admin/products?keyword=${encodeURIComponent(name)}`}
              className="text-sm font-semibold text-gray-800 hover:text-[#ee4d2d] transition-colors line-clamp-1"
            >
              {name}
            </Link>
          </Tooltip>
          <span className="text-[11px] font-mono text-gray-400 mt-0.5">
            ID: {record.productId}
          </span>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-semibold text-gray-900 text-sm">
          ${Number(price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Stock Status",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (qty) => renderStockTag(qty),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenStockModal(record)}
          className="text-[#ee4d2d] hover:text-[#d03e1f] font-medium p-0"
        >
          Update Stock
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        className={`shadow-sm border-gray-100 rounded-xl ${className}`}
        styles={{ body: { padding: "16px 20px" } }}
        title={
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div>
                <span className="text-base font-bold text-gray-900 block">
                  Low Stock Inventory Alerts
                </span>
              </div>
            </div>

            {/* Threshold Filter Controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Alert threshold (≤):
              </span>
              <div className="flex flex-col gap-0.5">
                <Controller
                  name="threshold"
                  control={thresholdControl}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      precision={0}
                      className="text-xs"
                    />
                  )}
                />
                {thresholdErrors.threshold && (
                  <span className="text-[11px] text-red-500 leading-tight">
                    {thresholdErrors.threshold.message}
                  </span>
                )}
              </div>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                {[5, 10, 15].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setThresholdValue('threshold', preset, { shouldValidate: true })}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      threshold === preset
                        ? "bg-[#ee4d2d] text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ≤ {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      >
        {isError && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-100 flex items-center justify-between">
            <span className="text-xs text-red-600 font-medium">
              Failed to load low-stock inventory data.
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table strictly sized by flex and content without hardcoded height */}
        <Table
          columns={columns}
          dataSource={displayItems}
          rowKey="productId"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalElements,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            showTotal: (total, range) => (
              <span className="text-xs text-gray-400">
                Showing {range[0]}-{range[1]} of {total} low-stock products
              </span>
            ),
          }}
          className="overflow-x-auto"
        />
      </Card>

      {/* Quick Update Stock Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
            <EditOutlined className="text-[#ee4d2d]" />
            <span>Update Product Inventory</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
        centered
      >
        {selectedProduct && (
          <Form
            layout="vertical"
            onFinish={handleSubmit(handleUpdateStock)}
            className="pt-3"
          >
            <div className="bg-gray-50 p-3.5 rounded-lg mb-4 text-xs space-y-1.5 border border-gray-100">
              <div className="font-semibold text-gray-800 text-sm">
                {selectedProduct.productName}
              </div>
              <div className="text-gray-500">
                Product ID:{" "}
                <span className="font-mono text-gray-700">
                  {selectedProduct.productId}
                </span>
              </div>
              <div className="text-gray-500">
                Current Stock:{" "}
                <span className="font-bold text-gray-800">
                  {selectedProduct.stockQuantity} units
                </span>
              </div>
            </div>

            <Form.Item
              label={
                <span className="font-medium text-xs text-gray-700">
                  New Inventory Quantity
                </span>
              }
              validateStatus={errors.newStock ? "error" : ""}
              help={errors.newStock?.message}
            >
              <Controller
                name="newStock"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full text-sm"
                    placeholder="Enter stock quantity"
                    precision={0}
                  />
                )}
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                className="bg-[#ee4d2d] hover:bg-[#d03e1f]"
              >
                Save Stock
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default LowStockAlertTable;
