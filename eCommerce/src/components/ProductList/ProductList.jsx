import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton } from "antd";
import { getProducts } from "../../apis/product.api";
import Product from "../Product/Product";
import { productKeys } from "@/constants/queryKeys";

const ProductList = () => {
  const { data, isLoading } = useQuery({
    queryKey: productKeys.list({ type: "recommended", pageSize: 48, pageNum: 1 }),
    queryFn: () => getProducts({ pageSize: 48, pageNum: 1 }),
  });

  const products = data?.data?.items || [];

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} loading className="shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 border-b-4 border-[#ee4d2d] py-4 bg-white text-center shadow-sm">
        <span className="text-lg font-bold uppercase text-[#ee4d2d]">
          DAILY DISCOVER
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
