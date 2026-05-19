import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Typography, Pagination } from 'antd'
import { getProductRecommendationsHybrid } from '../../apis/product.api'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import { productKeys } from '@/constants/queryKeys'

const { Title } = Typography

const ProductRecommendations = () => {
  const { productId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const pageSize = 48

  const { data, isLoading } = useQuery({
    queryKey: productKeys.recommendationsHybrid(productId, { page: page, size: pageSize }),
    queryFn: () => getProductRecommendationsHybrid(productId, { pageNum: page, pageSize }),
    enabled: !!productId,
    keepPreviousData: true,
  })

  const recommendations = data?.data?.items || []
  const totalElements = data?.data?.meta?.totalElements || 0

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage })
    window.scrollTo(0, 0)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Title level={2} className="mb-6 text-center text-[#ee4d2d]">You Might Also Like</Title>

      <ProductGrid products={recommendations} isLoading={isLoading} />

      <div className="mt-8 flex justify-center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={totalElements}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}

export default ProductRecommendations