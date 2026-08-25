import React from "react";
import UserLayout from "../layouts/UserLayout";
import Home from "../pages/Home/Home";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Cart from "../pages/Cart/Cart";
import OrderHistory from "../pages/OrderHistory/OrderHistory";
import Checkout from "../pages/Checkout/Checkout";
import OrderDetail from "../pages/OrderDetail/OrderDetail";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import SimilarProducts from "../pages/SimilarProducts/SimilarProducts";
import ProductRecommendations from "../pages/ProductRecommendations/ProductRecommendations";
import UserRecommendations from "../pages/UserRecommendations/UserRecommendations";
import MyAccount from "../pages/MyAccount/MyAccount";
import Profile from "../pages/Profile/Profile";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import BlockAdminRoute from "@/components/BlockAdminRoute/BlockAdminRoute";

const userRoutes = [
  {
    element: <BlockAdminRoute />,
    children: [
      {
        path: "/",
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "products/:productId/similar",
            element: <SimilarProducts />,
          },
          {
            path: "products/:productId",
            element: <ProductDetail />,
          },
          {
            path: "products/:productId/recommendations",
            element: <ProductRecommendations />,
          },
          {
            element: <ProtectedRoute roles={["USER"]} />,
            children: [
              {
                path: "cart",
                element: <Cart />,
              },
              {
                path: "recommendations",
                element: <UserRecommendations />,
              },
              {
                path: "checkout",
                element: <Checkout />,
              },
              {
                path: "my-orders",
                element: <OrderHistory />,
              },
              {
                path: "orders/:orderId",
                element: <OrderDetail />,
              },
              {
                path: "user/account",
                element: <MyAccount />,
                children: [
                  {
                    path: "profile",
                    element: <Profile />,
                  },
                  {
                    path: "password",
                    element: <ChangePassword />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default userRoutes;
