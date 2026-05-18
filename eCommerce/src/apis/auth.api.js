import { apiDefault , api} from ".";
import { ApiConstant } from "../constants/api.constant";

const authApi = () => ({
  register: async (data) => apiDefault.post(ApiConstant.auth.register, data),
  login: async (data) => apiDefault.post(ApiConstant.auth.login, data),
  refreshToken: async (data) =>
    apiDefault.post(ApiConstant.auth.refreshToken, data),
  forgotPassword: async (data) =>
    apiDefault.post(ApiConstant.auth.forgotPassword, data),
  resetPassword: async (data) =>
    apiDefault.post(ApiConstant.auth.resetPassword, data),
  changePassword: async (data) =>
    api.post(ApiConstant.auth.changePassword, data),
});

export const { register, login, refreshToken, forgotPassword, resetPassword, changePassword } =
  authApi();
