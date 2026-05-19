import * as yup from "yup";

export const registerSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).*$/,
      "Password must contain at least one letter and one number",
    ),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  fullName: yup.string().required("Full name is required"),
});
