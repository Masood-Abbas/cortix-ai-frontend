import api from "../utils/axios.js";

export const updateConversation = async (payload) => {
  const { data } = await api.post("/chat/update-conversation", payload);
  return data;
};
