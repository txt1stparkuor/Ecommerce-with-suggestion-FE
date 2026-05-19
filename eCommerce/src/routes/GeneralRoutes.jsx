import React from 'react'
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

const generalRoutes = [
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized></Unauthorized>
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
];

export default generalRoutes;
