import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Typography, Pagination, Empty } from 'antd'
import { getUserRecommendations } from '../../apis/user.api'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import useAuth from '../../hooks/useAuth'
import { userKeys } from '@/constants/queryKeys'

const { Title } = Typography;

const UserRecommendations = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 48;

  const { data, isLoading } = useQuery({
    queryKey: userKeys.recommendations({ page }),
    queryFn: () => getUserRecommendations({ pageNum: page, pageSize }),
    enabled: isAuthenticated,
    keepPreviousData: true,
  });

  const recommendations = data?.data?.items || [];
  const totalElements = data?.data?.meta?.totalElements || 0;

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
    window.scrollTo(0, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Empty description="Please log in to see your recommendations." />
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Title level={2} className="mb-6 text-center text-[#ee4d2d]">Recommended For You</Title>
      {isLoading ? (
        <ProductGrid products={[]} isLoading={isLoading}/>
      ) : recommendations.length > 0 ? (
        <>
          <ProductGrid products={recommendations} isLoading={isLoading} />
          <div className="mt-8 flex justify-center">
            <Pagination current={page} pageSize={pageSize} total={totalElements} onChange={handlePageChange} showSizeChanger={false} />
          </div>
        </>
      ) : (
        <Empty description="No recommendations found for you at the moment." />
      )}
    </div>
  );
};

export default UserRecommendations;