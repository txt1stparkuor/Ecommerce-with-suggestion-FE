import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Layout,
  Menu,
  InputNumber,
  Button,
  Rate,
  Pagination,
  Card,
  Empty,
  Typography,
  Divider,
} from 'antd'
import { getProducts } from '../../apis/product.api'
import { getAllCategories } from '../../apis/category.api'
import Product from '../../components/Product/Product'
import { categoryKeys, productKeys } from '@/constants/queryKeys'

const { Sider, Content } = Layout
const { Title } = Typography

const ProductByCategory = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceRange, setPriceRange] = useState([null, null])

  const queryParams = {
    page: searchParams.get('page') || '1',
    categoryId: searchParams.get('categoryId'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    minRating: searchParams.get('minRating'),
    sortBy: searchParams.get('sortBy') || 'averageRating',
    order: searchParams.get('order') || 'desc',
    pageSize: 60,
  }

  const { data: categoriesData } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getAllCategories,
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => {
      const params = {
        pageNum: queryParams.page,
        pageSize: queryParams.pageSize,
        categoryId: queryParams.categoryId,
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        minRating: queryParams.minRating,
        sortBy: queryParams.sortBy,
        order: queryParams.order,
      }
      // Remove null/undefined params
      Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);
      return getProducts(params)
    },
    keepPreviousData: true,
  })

  const products = productsData?.data?.items || []
  const totalProducts = productsData?.data?.meta?.totalElements || 0

  useEffect(() => {
    setPriceRange([queryParams.minPrice, queryParams.maxPrice])
  }, [queryParams.minPrice, queryParams.maxPrice])

  const handleFilterChange = (newParams) => {
    const newSearchParams = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })
    newSearchParams.set('page', '1') // Reset to first page on filter change
    setSearchParams(newSearchParams)
  }

  const handlePriceApply = () => {
    handleFilterChange({ minPrice: priceRange[0], maxPrice: priceRange[1] })
  }

  const handleClearFilters = () => {
    const newSearchParams = new URLSearchParams()
    if (queryParams.categoryId) {
      newSearchParams.set('categoryId', queryParams.categoryId)
    }
    setSearchParams(newSearchParams)
    setPriceRange([null, null])
  }

  const handlePageChange = (page) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', page)
    setSearchParams(newSearchParams)
    window.scrollTo(0, 0)
  }

  const handleSortChange = (sortBy, order) => {
    handleFilterChange({ sortBy, order })
  }

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card key={index} loading className="shadow-sm" />
      ))}
    </div>
  )

  const sortOptions = [
    { label: 'Popular', sortBy: 'averageRating', order: 'desc' },
    { label: 'Newest', sortBy: 'createdAt', order: 'desc' },
    { label: 'Price: Low to High', sortBy: 'price', order: 'asc' },
    { label: 'Price: High to Low', sortBy: 'price', order: 'desc' },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <Layout className="bg-transparent flex-row items-start">
        <Sider theme="light" width={250} className="p-4 rounded-sm shadow-sm bg-white mr-6">
          <Title level={5} className="uppercase">Categories</Title>
          <Menu
            mode="inline"
            selectedKeys={[queryParams.categoryId]}
            className="border-none"
            items={categoriesData?.data?.map(cat => ({
              key: cat.id,
              label: <Link to={`/products?categoryId=${cat.id}`}>{cat.name}</Link>
            }))}
          />
          <Divider />
          
          <Title level={5} className="uppercase mt-4">Price Range</Title>
          <div className="flex items-center gap-2">
            <InputNumber
              min={0}
              placeholder="Min"
              value={priceRange[0]}
              onChange={(val) => setPriceRange([val, priceRange[1]])}
              className="w-full"
            />
            <span>-</span>
            <InputNumber
              min={0}
              placeholder="Max"
              value={priceRange[1]}
              onChange={(val) => setPriceRange([priceRange[0], val])}
              className="w-full"
            />
          </div>
          <Button type="primary" className="w-full mt-2 bg-[#ee4d2d]" onClick={handlePriceApply}>Apply</Button>
          <Divider />

          <Title level={5} className="uppercase mt-4">Rating</Title>
          <Menu
            mode="inline"
            selectedKeys={[queryParams.minRating]}
            className="border-none"
            onClick={({ key }) => handleFilterChange({ minRating: key })}
            items={[5, 4, 3, 2, 1].map(star => ({
              key: String(star),
              label: <><Rate disabled defaultValue={star} style={{ fontSize: 14 }} /> & Up</>
            }))}
          />
          <Divider />

          <Button danger className="w-full mt-4" onClick={handleClearFilters}>Delete All</Button>
        </Sider>

        <Content>
          <div className="bg-white p-4 rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-4 bg-gray-100 p-3 rounded-sm">
              <span className="text-gray-600">Sort By</span>
              <div className="flex items-center gap-2">
                {sortOptions.map(opt => (
                  <Button
                    key={opt.label}
                    type={queryParams.sortBy === opt.sortBy && queryParams.order === opt.order ? 'primary' : 'default'}
                    className={queryParams.sortBy === opt.sortBy && queryParams.order === opt.order ? 'bg-[#ee4d2d]' : ''}
                    onClick={() => handleSortChange(opt.sortBy, opt.order)}
                  >
                    {opt.label}
                  </Button>
                ))}
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
        </Content>
      </Layout>
    </div>
  )
}

export default ProductByCategory