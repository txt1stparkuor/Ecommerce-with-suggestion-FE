import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Typography, Skeleton, Button, Card } from "antd";
import "swiper/css";
import "swiper/css/navigation";
import {
  HomeOutlined,
  LaptopOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  CarOutlined,
  DesktopOutlined,
  GiftOutlined,
  MedicineBoxOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import { getAllCategories } from "../../apis/category.api";
import ProductList from "../../components/ProductList/ProductList";
import RecommendedProducts from "../../components/RecommendedProducts/RecommendedProducts";
import { categoryKeys } from "@/constants/queryKeys";

const { Title } = Typography;

const Home = () => {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getAllCategories,
  });
  const navigate = useNavigate();
  const categoryIcons = {
    MusicalInstruments: <SoundOutlined />,
    HomeAndKitchen: <HomeOutlined />,
    HomeImprovement: <ToolOutlined />,
    CarAndMotorbike: <CarOutlined />,
    OfficeProducts: <DesktopOutlined />,
    ToysAndGames: <GiftOutlined />,
    HealthAndPersonalCare: <MedicineBoxOutlined />,
    ComputersAndAccessories: <LaptopOutlined />,
    Electronics: <ShoppingCartOutlined />,
  };

  const categories = categoriesData?.data || [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-md mb-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          className="w-full h-full"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src="https://dealzy-content-p3jsr2.s3.ap-south-1.amazonaws.com/Amazon_New_Year_Sale_2026_Best_Offers_Discounts_and_Buying_Tips_7189aba63c.png"
                alt="Banner 1"
                className="object-cover w-full h-full aspect-[1024/286]"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                <Title level={2}>Welcome to Our Store</Title>

                <p>Discover amazing products and deals!</p>
                <Button type="primary" onClick={() => navigate("/products")}>
                  Shop Now
                </Button>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src="https://static.vecteezy.com/system/resources/previews/056/316/340/non_2x/new-year-eve-2026-greeting-card-design-with-glittering-fireworks-happy-holidays-postcard-concept-holiday-background-with-glitters-social-network-timeline-story-template-3d-isolated-numbers-20-26-vector.jpg"
                alt="Banner 2"
                className="object-cover w-full h-full aspect-[1024/286]"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                <p>Check out our most popular collection.</p>
                <Button type="primary" onClick={() => navigate("/products")}>
                  Explore
                </Button>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src="https://cdn.zoutons.com/images/originals/blog/1767676912088.jpg_1767676913.png"
                alt="Banner 2"
                className="object-cover w-full h-full aspect-[1024/286]"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                <p>More discounts than ever!</p>
                <Button type="primary" onClick={() => navigate("/products")} className="mt-1">
                  Explore
                </Button>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <Title level={4} style={{ marginBottom: "1rem" }}>
          Categories
        </Title>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 pb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton.Button
                key={index}
                active
                block
                style={{ height: 96, borderRadius: "8px" }}
              />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            spaceBetween={12}
            slidesPerView={2}
            navigation
            breakpoints={{
              480: { slidesPerView: 3 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },

              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
            className="pb-10"
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id}>
                <Link
                  to={`/products?categoryId=${category.id}`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-2 text-center transition-all hover:border-[#ee4d2d] hover:bg-white hover:shadow-md">
                    {categoryIcons[category.name?.replace("&", "And")]}
                    <span className="text-sm font-medium text-gray-700 line-clamp-2">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <RecommendedProducts />

      <ProductList />

      <div className="mt-8 text-center">
        <Link to="/products" onClick={() => window.scrollTo(0, 0)}>
          <Button type="default" size="large">
            Watch More
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
