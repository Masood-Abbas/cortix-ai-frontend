import api from "../utils/axios.js";

const sendMessage = async (payload) => {
  const { data } = await api.post("/agent/chat", payload);
  if (typeof data === "string") return { content: data, images: [] };
  if (data && typeof data === "object") {
    return {
      content: data.answer || data.awnser || data.content || "",
      images: Array.isArray(data.images) ? data.images : [],
      artifacts: Array.isArray(data.artifacts) ? data.artifacts : [],
      files: Array.isArray(data.files) ? data.files : [],
      user: data.user || data.userData || null,
    };
  }
  return data;
};

export default sendMessage;
