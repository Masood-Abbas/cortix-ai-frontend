import api from "../utils/axios.js";

export const confirmBillingSession = async (sessionId) => {
  const { data } = await api.post("/billing/confirm", { sessionId });
  return data;
};
