import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input, Button, Card, Typography } from 'antd'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import backgroundImage from '../../assets/background.jpg'

import { register } from '../../apis/auth.api'
import { registerSchema } from '../../utils/registerValidation'
import useAuth from '../../hooks/useAuth'
import { userKeys } from '@/constants/queryKeys'

const { Title, Text } = Typography

const Register = () => {
  const navigate = useNavigate()
  const { saveUser } = useAuth()
  const queryClient = useQueryClientt()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      fullName: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: (body) => register(body),
    onSuccess: (response) => {
      const authData = response.data
      saveUser(authData)
      toast.success('Registration successful!')
      queryClient.removeQueries({ queryKey: userKeys.all })
      navigate('/')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    },
  })

  const onSubmit = (data) => {
    registerMutation.mutate(data)
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-6 text-center">
          <Title level={2}>Register</Title>
          <Text type="secondary">Create an account to get started</Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input {...field} size='large' placeholder="Enter your username" status={errors.username ? 'error' : ''} />
              )}
            />
            {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                  status={errors.password ? 'error' : ''}
                  size='large'
                />
              )}
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} size='large' placeholder="Enter your email" status={errors.email ? 'error' : ''} />
              )}
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input {...field} size='large' placeholder="Enter your full name" status={errors.fullName ? 'error' : ''} />
              )}
            />
            {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message}</span>}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={registerMutation.isPending}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500"
            size="large"
          >
            Register
          </Button>

          <div className="mt-4 text-center">
            <Text>Already have an account? </Text>
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Register
