import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Typography, Button } from 'antd'
import { Link } from 'react-router-dom'
import { getUserRecommendations } from '../../apis/user.api'
import ProductGrid from '../ProductGrid/ProductGrid'
import useAuth from '../../hooks/useAuth'
import { userKeys } from '@/constants/queryKeys'

const { Title } = Typography

const RecommendedProducts = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: userKeys.recommendations({ view: "home", pageSize: 12, pageNum: 1 }),
    queryFn: () => getUserRecommendations({ pageSize: 12, pageNum: 1 }),
    enabled: isAuthenticated,
  });

  const products = data?.data?.items || []

  if (!isAuthenticated || (!isLoading && products.length === 0)) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="mb-4 border-b-4 border-[#ee4d2d] py-4 bg-white text-center shadow-sm">
        <span className="text-lg font-bold uppercase text-[#ee4d2d]">
          Recommended For You
        </span>
      </div>
      <ProductGrid products={products} isLoading={isLoading} />
      <div className="mt-8 text-center">
        <Link to="/recommendations" onClick={() => window.scrollTo(0, 0)}>
          <Button type="default" size="large">Watch More</Button>
        </Link>
      </div>
    </div>
  );
};

export default RecommendedProducts;