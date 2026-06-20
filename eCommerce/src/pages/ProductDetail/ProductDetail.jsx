import React, { useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Rate,
  InputNumber,
  Button,
  Skeleton,
  Typography,
  Avatar,
  Pagination,
  Modal,
  Input,
  Breadcrumb,
  Card,
  Grid,
} from "antd";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getProductById,
  getProductReviews,
  addProductReview,
  getProductRecommendationsHybrid,
} from "../../apis/product.api";
import { addToCart } from "../../apis/cart.api";
import { reviewSchema } from "../../utils/reviewValidation";
import useAuth from "../../hooks/useAuth";
import Product from "../../components/Product/Product";
import { cartKeys, productKeys } from "@/constants/queryKeys";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const reviewPage = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const screens = useBreakpoint();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  const { data: reviewsData } = useQuery({
    queryKey: productKeys.reviews(productId, { page: reviewPage }),
    queryFn: () =>
      getProductReviews(productId, { pageNum: reviewPage, pageSize: 5 }),
    enabled: !!productId,
    keepPreviousData: true,
  });

  const { data: recommendationsData, isLoading: isLoadingRecommendations } =
    useQuery({
      queryKey: productKeys.recommendationsHybrid(productId, {
        page: 1,
        size: 18,
      }),
      queryFn: () =>
        getProductRecommendationsHybrid(productId, {
          pageNum: 1,
          pageSize: 18,
        }),
      enabled: !!productId && isAuthenticated,
    });

  const addToCartMutation = useMutation({
    mutationFn: (body) => addToCart(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to add the product to cart",
      );
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: (data) => addProductReview(productId, data),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      setIsReviewModalOpen(false);
      reset();
      queryClient.invalidateQueries({
        queryKey: productKeys.reviews(productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleBuyNow = async () => {
    try {
      await addToCartMutation.mutateAsync({ productId, quantity });
      navigate("/cart", { state: { selectedProductId: productId } });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const product = data?.data;
  const reviews = reviewsData?.data?.items || [];
  const totalReviews = reviewsData?.data?.meta?.totalElements || 0;
  const recommendations = recommendationsData?.data?.items || [];
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-white mt-4 rounded-sm shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[35%]">
            <div className="relative w-full pt-[100%] overflow-hidden border border-gray-200 rounded-md">
              <Skeleton.Image
                active
                className="absolute top-0 left-0 !w-full !h-full [&_.ant-skeleton-image]:!w-full [&_.ant-skeleton-image]:!h-full"
              />
            </div>
          </div>
          <div className="w-full md:w-[65%] space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 bg-white mt-4 rounded-sm shadow-sm">
      <div className="mb-4">
        <Breadcrumb
          className="text-xs md:text-sm"
          items={product.categoryPath?.split("|").map((c) => ({ title: c }))}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left Side - Image */}
        <div className="w-full md:w-[35%]">
          <div className="relative w-full pt-[100%] overflow-hidden border border-gray-200 rounded-md">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-contain p-2"
            />
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="w-full md:w-[65%] flex flex-col gap-3 md:gap-4">
          <Title
            level={3}
            className="!mb-0 font-medium !text-lg md:!text-xl lg:!text-2xl"
          >
            {product.name}
          </Title>

          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <div className="flex items-center gap-1 border-b border-b-[#ee4d2d] pb-1">
              <span className="text-lg font-bold text-[#ee4d2d] border-b border-b-[#ee4d2d]">
                {product.averageRating?.toFixed(1)}
              </span>
              <Rate
                disabled
                allowHalf
                defaultValue={product.averageRating}
                className="text-sm text-[#ee4d2d]"
                style={{ fontSize: 14 }}
              />
            </div>
            <div className="flex h-6 items-center gap-1 border-l border-gray-300 pl-3 md:pl-4">
              <span className="text-lg font-medium border-b border-b-black">
                {product.ratingCount}
              </span>
              <span className="text-sm text-gray-500">Ratings</span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-sm bg-gray-50 p-4">
            {product.originalPrice && product.discountPercentage > 0 && (
              <Text delete className="text-sm md:text-base text-gray-500">
                ₹{product.originalPrice.toLocaleString()}
              </Text>
            )}
            <Text className="text-2xl md:text-3xl font-medium text-[#ee4d2d]">
              ₹{product.price.toLocaleString()}
            </Text>
            {product.discountPercentage > 0 && (
              <span className="rounded-sm bg-[#ee4d2d] px-1 py-0.5 text-xs font-bold uppercase text-white">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          <div className="mt-2 md:mt-4 flex items-center gap-4 md:gap-8">
            <span className="w-24 text-gray-500">Quantity</span>
            <div className="flex items-center gap-4">
              <InputNumber
                min={1}
                max={product.stockQuantity}
                defaultValue={1}
                value={quantity}
                onChange={(value) => setQuantity(value)}
              />
              <span className="text-sm text-gray-500">
                {product.stockQuantity} pieces available
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <Button
              type="primary"
              ghost
              icon={<ShoppingCartOutlined />}
              size={screens.md ? "large" : "middle"}
              className="h-10 md:h-12 px-6 md:px-8 !border-[#ee4d2d] !bg-[#ee4d2d]/10 !text-[#ee4d2d]"
              onClick={() => addToCartMutation.mutate({ productId, quantity })}
              loading={addToCartMutation.isPending}
            >
              Add To Cart
            </Button>
            <Button
              type="primary"
              size={screens.md ? "large" : "middle"}
              className="h-10 md:h-12 px-10 md:px-12 !bg-[#ee4d2d]"
              onClick={handleBuyNow}
              loading={addToCartMutation.isPending}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8 border-t pt-4">
        <Title level={4} className="text-lg md:text-xl">
          Product Description
        </Title>
        <Paragraph className="whitespace-pre-line text-gray-600 text-base md:text-lg">
          {product.description?.replace(/\|/g, "\n✔️ ")}
        </Paragraph>
      </div>

      <div className="mt-6 md:mt-8 border-t pt-4">
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0 text-lg md:text-xl">
            Product Reviews
          </Title>
          <Button
            type="primary"
            onClick={() => setIsReviewModalOpen(true)}
            size={screens.md ? "middle" : "small"}
            className="bg-[#ee4d2d] text-xs md:text-sm"
          >
            Write a Review
          </Button>
        </div>
        <div className="flex flex-col gap-4 md:gap-6 mt-4">
          {reviews.length > 0 ? (
            <>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      icon={<UserOutlined />}
                      size={screens.md ? "middle" : "small"}
                    />
                    <Text strong className="text-sm md:text-base">
                      {review.userFullName}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Rate
                      disabled
                      defaultValue={review.rating}
                      style={{ fontSize: 12 }}
                    />
                    <Text type="secondary" className="text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                  {review.comment && (
                    <Paragraph className="text-gray-600 mb-0 text-sm md:text-base">
                      {review.comment}
                    </Paragraph>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <Pagination
                  size={screens.md ? "middle" : "small"}
                  current={reviewPage}
                  pageSize={5}
                  total={totalReviews}
                  onChange={(page) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", page);
                    setSearchParams(newParams);
                  }}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Text type="secondary">No reviews yet.</Text>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-8">
        {isAuthenticated && <Title level={4}>You Might Also Like</Title>}
        {isLoadingRecommendations ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} loading className="shadow-sm" />
            ))}
          </div>
        ) : (
          <>
            {isAuthenticated && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {recommendations.map((item) => {
                  const recommendedProduct = {
                    id: item.productId,
                    name: item.productName,
                    imageUrl: item.imgLink,
                    price: item.discountedPrice,
                    averageRating: item.rating,
                    discountPercentage:
                      item.actualPrice > 0 &&
                      item.actualPrice > item.discountedPrice
                        ? Math.round(
                            ((item.actualPrice - item.discountedPrice) /
                              item.actualPrice) *
                              100,
                          )
                        : 0,
                  };
                  return (
                    <Product
                      key={item.productId}
                      product={recommendedProduct}
                    />
                  );
                })}
              </div>
            )}
            {recommendations.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  to={`/products/${productId}/recommendations`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Button type="default" size="large">
                    Watch More
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        {!isAuthenticated && (
          <Link
            to={`/products/${productId}/similar`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <Button type="default" size="large">
              See Similar Products
            </Button>
          </Link>
        )}
      </div>
      <Modal
        title="Write a Review"
        open={isReviewModalOpen}
        onCancel={() => {
          setIsReviewModalOpen(false);
          reset();
        }}
        footer={null}
      >
        <form
          onSubmit={handleSubmit((data) => addReviewMutation.mutate(data))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => <Rate {...field} />}
            />
            {errors.rating && (
              <span className="text-xs text-red-500">
                {errors.rating.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Comment</label>
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  status={errors.comment ? "error" : ""}
                />
              )}
            />
            {errors.comment && (
              <span className="text-xs text-red-500">
                {errors.comment.message}
              </span>
            )}
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={addReviewMutation.isPending}
            className="w-full bg-[#ee4d2d]"
          >
            Submit Review
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
