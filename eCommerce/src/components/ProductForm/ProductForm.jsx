import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Upload,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useDebounce from "../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { getLeafCategories } from "../../apis/category.api";
import { productSchema } from "../../utils/productValidation";
import { categoryKeys } from "@/constants/queryKeys";

const ProductForm = ({ open, onCancel, onSubmit, initialValues, loading }) => {
  const isEditing = !!initialValues;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const imageFile = watch("image");

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.leaf({ keyword: debouncedKeyword }),
    queryFn: () => getLeafCategories({ keyword: debouncedKeyword }),
  });


  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          ...initialValues,
          image: null,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: undefined,
          originalPrice: undefined,
          stockQuantity: undefined,
          categoryId: undefined,
          image: null,
        });
      }
    }
  }, [initialValues, open, reset]);

  const handleFormSubmit = (data) => {
    const formData = new FormData();

    const productData = { ...data };
    delete productData.image;

    formData.append(
      "data",
      new Blob([JSON.stringify(productData)], { type: "application/json" })
    );

    if (data.image && data.image[0] && data.image[0].originFileObj) {
      formData.append("image", data.image[0].originFileObj);
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Product" : "Add Product"}
      onCancel={onCancel}
      destroyOnHidden
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit(handleFormSubmit)}
          className="bg-[#ee4d2d]"
        >
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Name"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <Form.Item
          label="Description"
          required
          validateStatus={errors.description ? "error" : ""}
          help={
            errors.description?.message ||
            'Use "|" to separate lines for product highlights.'
          }
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input.TextArea {...field} rows={4} />}
          />
        </Form.Item>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Price"
            required
            validateStatus={errors.price ? "error" : ""}
            help={errors.price?.message}
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} className="w-full" min={0} />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Original Price"
            validateStatus={errors.originalPrice ? "error" : ""}
            help={errors.originalPrice?.message}
          >
            <Controller
              name="originalPrice"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} className="w-full" min={0} />
              )}
            />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Stock Quantity"
            required
            validateStatus={errors.stockQuantity ? "error" : ""}
            help={errors.stockQuantity?.message}
          >
            <Controller
              name="stockQuantity"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} className="w-full" min={0} />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Category"
            required
            validateStatus={errors.categoryId ? "error" : ""}
            help={errors.categoryId?.message}
          >
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  loading={isLoadingCategories}
                  placeholder="Select a category"
                  showSearch
                  filterOption={false}
                  onSearch={setKeyword}
                  value={field.value}
                  options={categoriesData?.data?.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
              )}
            />
          </Form.Item>
        </div>
        <Form.Item label="Image">
          {isEditing && initialValues?.imageUrl && !imageFile && (
            <div className="mb-2">
              <p>Current Image:</p>
              <Image
                src={initialValues.imageUrl}
                alt="current product"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <Controller
            name="image"
            control={control}
            render={() => (
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                onChange={(e) => {
                  setValue("image", e.fileList.length > 0 ? e.fileList : null);
                }}
                onRemove={() => {
                  setValue("image", null);
                }}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            )}
          />
          {errors.image && (
            <span className="text-xs text-red-500">{errors.image.message}</span>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
