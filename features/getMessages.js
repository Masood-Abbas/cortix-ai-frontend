import api from "../utils/axios.js";

export const getMessages = async (id, signal) => {
  const { data } = await api.get(`/chat/get-messge/${id}`, { signal });
  return data;
};
