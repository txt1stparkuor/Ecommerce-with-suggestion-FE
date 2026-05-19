import React, { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Pagination,
  Card,
  Empty,
  Drawer, // Added Drawer
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { getProducts } from "../../apis/product.api";
import Product from "../../components/Product/Product";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import { productKeys } from "@/constants/queryKeys";
import { Select } from 'antd'; 

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const queryParams = {
    page: searchParams.get("page") || "1",
    keyword: searchParams.get("keyword"),
    categoryId: searchParams.get("categoryId"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    minRating: searchParams.get("minRating"),
    sortBy: searchParams.get("sortBy") || "averageRating",
    isAscending: searchParams.get("isAscending") === "true",
    pageSize: 60,
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => {
      const params = {
        keyword: queryParams.keyword,
        pageNum: queryParams.page,
        pageSize: queryParams.pageSize,
        categoryId: queryParams.categoryId,
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        minRating: queryParams.minRating,
        sortBy: queryParams.sortBy,
        isAscending: queryParams.isAscending,
      };
      Object.keys(params).forEach(
        (key) => params[key] == null && delete params[key],
      );
      return getProducts(params);
    },
    keepPreviousData: true,
  });

  const products = productsData?.data?.items || [];
  const totalProducts = productsData?.data?.meta?.totalElements || 0;

  const handleFilterChange = useCallback(
    (newParams) => {
      const newSearchParams = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });
      newSearchParams.set("page", "1");
      setSearchParams(newSearchParams);
      setIsMobileDrawerOpen(false);
    },
    [searchParams, setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    const newSearchParams = new URLSearchParams();
    if (queryParams.categoryId) {
      newSearchParams.set("categoryId", queryParams.categoryId);
    }
    if (queryParams.keyword) {
      newSearchParams.set("keyword", queryParams.keyword);
    }
    setSearchParams(newSearchParams);
    setIsMobileDrawerOpen(false);
  }, [queryParams.categoryId, queryParams.keyword, setSearchParams]);

  const handlePageChange = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page);
    setSearchParams(newSearchParams);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (sortBy, isAscending) => {
    handleFilterChange({ sortBy, isAscending });
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card key={index} loading className="shadow-sm" />
      ))}
    </div>
  );

  const sortOptions = [
    { label: "Popular", sortBy: "averageRating", isAscending: false },
    { label: "Price: Low to High", sortBy: "price", isAscending: true },
    { label: "Price: High to Low", sortBy: "price", isAscending: false },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="hidden lg:block w-[250px] shrink-0">
          <FilterSidebar
            queryParams={queryParams}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="bg-white p-4 rounded-sm shadow-sm">
            {/* Sort Bar (Made responsive with flex-wrap) */}
            <div className="flex items-center justify-between mb-4 bg-gray-100 p-3 rounded-sm gap-3">
              <div className="flex items-center gap-2">
                <Button
                  className="lg:hidden"
                  icon={<FilterOutlined />}
                  onClick={() => setIsMobileDrawerOpen(true)}
                >
                  Filters
                </Button>
                <span className="text-gray-600 hidden sm:inline">Sort By</span>
              </div>

              {/* DESKTOP: Show Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {sortOptions.map((opt) => (
                  <Button
                    key={opt.label}
                    type={
                      queryParams.sortBy === opt.sortBy &&
                      queryParams.isAscending === opt.isAscending
                        ? "primary"
                        : "default"
                    }
                    className={
                      queryParams.sortBy === opt.sortBy &&
                      queryParams.isAscending === opt.isAscending
                        ? "bg-[#ee4d2d]"
                        : ""
                    }
                    onClick={() =>
                      handleSortChange(opt.sortBy, opt.isAscending)
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              {/* MOBILE: Show Select Dropdown */}
              <div className="sm:hidden w-full max-w-[180px]">
                <Select
                  value={`${queryParams.sortBy}-${queryParams.isAscending}`}
                  className="w-full"
                  onChange={(val) => {
                    const [sortBy, isAscendingStr] = val.split("-");
                    handleSortChange(sortBy, isAscendingStr === "true");
                  }}
                  options={sortOptions.map((opt) => ({
                    value: `${opt.sortBy}-${opt.isAscending}`,
                    label: opt.label,
                  }))}
                />
              </div>
            </div>

            {isLoading ? (
              renderSkeleton()
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {products.map((product) => (
                    <Product key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={Number(queryParams.page)}
                    pageSize={queryParams.pageSize}
                    total={totalProducts}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <Empty description="No products found for these filters." />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="Filters"
        placement="left"
        onClose={() => setIsMobileDrawerOpen(false)}
        open={isMobileDrawerOpen}
        size={280}
        styles={{ body: { padding: 0, backgroundColor: "#f3f4f6" } }}
      >
        <FilterSidebar
          queryParams={queryParams}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </Drawer>
    </div>
  );
};

export default ProductsPage;
