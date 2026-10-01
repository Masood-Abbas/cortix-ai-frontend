import api from "../utils/axios.js";

export const getConversation = async (signal) => {
  const { data } = await api.get("/chat/get-conversation", { signal });
  return data;
};
