import api from "../utils/axios.js";

export const createBillingOrder = async (plan) => {
  const { data } = await api.post("/billing/create", { plan });
  if (!data?.checkoutUrl) throw new Error("Checkout URL not returned");
  return data;
};
