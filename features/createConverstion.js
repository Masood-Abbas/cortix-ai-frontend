import api from "../utils/axios.js";

export const createConversation = async () => {
  const { data } = await api.post("/chat/create-conversation");
  return data;
};
