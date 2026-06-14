import * as yup from "yup";

export const userSchema = (isEditing = false) =>
  yup.object({
    username: yup
      .string()
      .min(4, "Username must be between 4 and 50 characters")
      .max(50, "Username must be between 4 and 50 characters")
      .required("Username is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    fullName: yup.string().required("Full name is required"),
    password: isEditing
      ? yup
          .string()
          .transform((value) => (!value ? undefined : value))
          .min(6, "Password must be at least 6 characters")
          .max(100, "Password cannot exceed 100 characters")
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d).*$/,
            "Password must contain at least one letter and one number",
          )
      : yup
          .string()
          .required("New password is required")
          .min(6, "Password must be at least 6 characters long")
          .max(100, "Password cannot exceed 100 characters")
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d).*$/,
            "Password must contain at least one letter and one number",
          ),
    role: yup.string().required("Role is required"),
  });

export const profileSchema = yup.object().shape({
  username: yup
    .string()
    .min(4, "Username must be between 4 and 50 characters")
    .max(50, "Username must be between 4 and 50 characters")
    .required("Username is required"),
  fullName: yup.string().required("Full name is required"),
});
