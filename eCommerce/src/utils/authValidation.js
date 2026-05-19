import * as yup from "yup";

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).*$/,
      "Password must contain at least one letter and one number",
    ),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password"),
});

export const changePasswordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Old password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).*$/,
      "Password must contain at least one letter and one number"
    ),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).*$/,
      "Password must contain at least one letter and one number"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password"),
});
