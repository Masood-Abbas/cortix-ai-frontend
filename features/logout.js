import api from "../utils/axios.js";

export const logout = async () => {
  await api.get("/auth/logout");
};
