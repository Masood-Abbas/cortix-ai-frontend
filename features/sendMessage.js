import api from "../utils/axios.js";

const sendMessage = async (payload) => {

  console.log("payload",payload)
  const hasFile =
    payload?.file instanceof File ||
    payload?.file instanceof Blob ||
    Boolean(payload?.file?.name);
  const body = hasFile ? new FormData() : payload;
  if (hasFile) {
    body.append("prompt", payload.prompt || "");
    body.append("conversationId", payload.conversationId || "");
    body.append("agent", payload.agent || "auto");
    body.append("file", payload.file);
  }

  const { data } = await api.post("/agent/chat", body);
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
