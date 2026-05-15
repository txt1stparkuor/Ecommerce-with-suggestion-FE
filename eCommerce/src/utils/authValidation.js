import * as yup from 'yup';

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});
