import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Typography,
  Image,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductById,
  exportAmazonCSV, 
} from "../../../apis/product.api";
import useDebounce from "../../../hooks/useDebounce";
import ProductForm from "../../../components/ProductForm/ProductForm";
import { productKeys } from "@/constants/queryKeys";

const { Title } = Typography;
const { Search } = Input;

const ProductManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || ""
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 4;

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

  const { data: productsData, isLoading } = useQuery({
    queryKey: productKeys.list({ keyword, page, pageSize }),
    queryFn: () => getProducts({ keyword, pageNum: page, pageSize }),
    keepPreviousData: true,
  });

  // Logic xử lý Xuất file CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportAmazonCSV();
      if (!result) {
        toast.error("No data received");
        return;
      }
      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `amazon_export_${new Date().getTime()}.csv`
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (body) => createProduct(body),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateProduct(id, body),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = async (id) => {
    try {
      const res = await getProductById(id);
      setEditingProduct(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch product details");
    }
  };

  const handleViewProduct = async (id) => {
    try {
      const res = await getProductById(id);
      Modal.info({
        title: "Product Details",
        width: 600,
        content: (
          <div className="mt-4 space-y-2">
            <p>
              <strong>Name:</strong> {res.data.name}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <p className="whitespace-pre-line text-gray-600">
              {res.data.description?.replace(/\|/g, "\n✔️ ")}
            </p>
            <p>
              <strong>Price:</strong> ₹{res.data.price?.toLocaleString()}
            </p>
            <p>
              <strong>Stock:</strong> {res.data.stockQuantity}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {res.data.categoryPath?.replace(/\|/g, " > ")}
            </p>
            {res.data.imageUrl && (
              <div className="mt-4">
                <Image
                  src={res.data.imageUrl}
                  width={200}
                  className="rounded-lg shadow"
                />
              </div>
            )}
          </div>
        ),
        onOk() {},
      });
    } catch (error) {
      toast.error("Failed to fetch product details");
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = (formData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "image",
      render: (imageUrl) => (
        <Image
          width={60}
          height={60}
          src={imageUrl || "https://via.placeholder.com/150"}
          alt="product"
          className="rounded shadow-sm"
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    { title: "Stock", dataIndex: "stockQuantity", key: "stockQuantity" },
    {
      title: "Category",
      dataIndex: "categoryPath",
      key: "categoryPath",
      width: "20%",
      ellipsis: true,
      render: (path) => (
        <span className="text-xs text-gray-500">
          {path?.replace(/\|/g, " > ")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewProduct(record.id)}
            title="View Details"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record.id)}
            title="Edit Product"
          />
          <Popconfirm
            title="Delete the product"
            description="Are you sure to delete this product?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
              title="Delete Product"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Product Management
        </Title>
        <Space size="small">
          {/* NÚT EXPORT CHO AI */}
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            loading={isExporting}
            className="flex items-center border-green-500 text-green-600 hover:text-green-700 hover:border-green-700"
          >
            Export for AI
          </Button>

          {/* NÚT THÊM SẢN PHẨM */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-[#ee4d2d] flex items-center"
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Space>
      </div>

      <div className="mb-6">
        <Search
          placeholder="Search by product name..."
          allowClear
          size="large"
          onChange={handleSearchChange}
          value={searchTerm}
          className="max-w-md"
        />
      </div>

      <Table
        columns={columns}
        dataSource={productsData?.data?.items || []}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: productsData?.data?.meta?.totalElements || 0,
          showSizeChanger: false,
        }}
        loading={isLoading}
        onChange={handleTableChange}
        bordered
      />

      {isModalOpen && (
        <ProductForm
          open={isModalOpen}
          onCancel={handleCancelModal}
          onSubmit={handleSubmitForm}
          initialValues={editingProduct}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProductManagement;
