import React, { useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Menu, InputNumber, Button, Rate, Divider, Typography } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { getAllCategories } from '../../apis/category.api'
import { priceRangeSchema } from '../../utils/filterValidation'

const { Title } = Typography

const FilterSidebar = memo(({ queryParams, onFilterChange, onClearFilters }) => {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      minPrice: queryParams.minPrice || '',
      maxPrice: queryParams.maxPrice || '',
    },
    resolver: yupResolver(priceRangeSchema),
  })

  useEffect(() => {
    reset({
      minPrice: queryParams.minPrice || '',
      maxPrice: queryParams.maxPrice || '',
    })
  }, [queryParams.minPrice, queryParams.maxPrice, reset])

  const onSubmit = (data) => {
    onFilterChange(data)
  }

  return (
    <div className="p-4 rounded-sm shadow-sm bg-white w-full">
      <Title level={5} className="uppercase">Categories</Title>
      <Menu
        mode="inline"
        selectedKeys={[queryParams.categoryId]}
        items={categoriesData?.data?.map(cat => ({
          key: cat.id,
          label: <Link to={`/products?categoryId=${cat.id}`}>{cat.name}</Link>
        }))}
      />
      <Divider />
      
      <Title level={5} className="uppercase mt-4">Price Range</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-2">
          <Controller
            name="minPrice"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                placeholder="Min"
                className="w-full"
                status={errors.minPrice ? 'error' : ''}
              />
            )}
          />
          <span>-</span>
          <Controller
            name="maxPrice"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                placeholder="Max"
                className="w-full"
                status={errors.maxPrice ? 'error' : ''}
              />
            )}
          />
        </div>
        {errors.maxPrice && <div className="text-red-500 text-xs mt-1">{errors.maxPrice.message}</div>}
        <Button type="primary" htmlType="submit" className="w-full mt-2 bg-[#ee4d2d]">Apply</Button>
      </form>
      <Divider />

      <Title level={5} className="uppercase mt-4">Rating</Title>
      <Menu
        mode="inline"
        selectedKeys={[queryParams.minRating]}
        onClick={({ key }) => onFilterChange({ minRating: key })}
        items={[5, 4, 3, 2, 1].map((star) => ({
          key: String(star),
          label: <><Rate disabled defaultValue={star} style={{ fontSize: 14 }} /> & Up</>,
        }))}
      />
      <Divider />

      <Button danger className="w-full mt-4" onClick={onClearFilters}>Delete All</Button>
    </div>
  )
})

export default FilterSidebar