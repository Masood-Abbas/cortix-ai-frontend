import { createSlice } from "@reduxjs/toolkit";
import { loadMessages, sendChatMessage, messageQueued } from "../../features/chatActions.js";
import { getUserId, setUserData } from "./userSlice.js";

const initialState = { byConversation: {}, sendRequestId: null, sendConversationId: null, error: null, ownerId: null, selectedArtifactId: null };
const record = (state, id) => state.byConversation[id] ??= { items: [], loading: false, error: null, requestId: null };

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setSelectedArtifact: (state, { payload }) => {
      state.selectedArtifactId = payload || null;
    },
  },
  extraReducers: (builder) => builder
    .addCase(setUserData, (state, { payload }) => {
      const ownerId = getUserId(payload);
      if (ownerId !== state.ownerId) return { ...initialState, byConversation: {}, ownerId };
    })
    .addCase(loadMessages.pending, (state, { meta }) => {
      const chat = record(state, meta.arg);
      chat.loading = true;
      chat.error = null;
      chat.requestId = meta.requestId;
    })
    .addCase(loadMessages.fulfilled, (state, { payload, meta }) => {
      const chat = state.byConversation[meta.arg];
      if (chat?.requestId !== meta.requestId) return;
      chat.items = payload;
      chat.loading = false;
      chat.requestId = null;
    })
    .addCase(loadMessages.rejected, (state, { meta }) => {
      const chat = state.byConversation[meta.arg];
      if (chat?.requestId !== meta.requestId) return;
      chat.loading = false;
      chat.requestId = null;
      if (!meta.aborted) chat.error = "Could not load messages. Reopen this chat to retry.";
    })
    .addCase(sendChatMessage.pending, (state, { meta }) => {
      state.sendRequestId = meta.requestId;
      state.sendConversationId = meta.arg.conversationId || null;
      state.error = null;
      if (meta.arg.conversationId) {
        const chat = record(state, meta.arg.conversationId);
        chat.requestId = null;
        chat.loading = false;
        chat.error = null;
      }
    })
    .addCase(messageQueued, (state, { payload }) => {
      if (state.sendRequestId !== payload.requestId) return;
      state.sendConversationId = payload.conversationId;
      const chat = record(state, payload.conversationId);
      chat.requestId = null;
      chat.loading = false;
      chat.items.push({ role: "user", content: payload.prompt });
    })
    .addCase(sendChatMessage.fulfilled, (state, { payload, meta }) => {
      if (state.sendRequestId !== meta.requestId) return;
      record(state, payload.conversationId).items.push({ role: "assistant", content: payload.content, images: payload.images || [], artifacts: payload.artifacts || [], files: payload.files || [] });
      state.sendRequestId = null;
      state.sendConversationId = null;
    })
    .addCase(sendChatMessage.rejected, (state, { meta }) => {
      if (state.sendRequestId !== meta.requestId) return;
      const error = "Could not complete the reply. Reopen the chat to check saved messages before retrying.";
      if (state.sendConversationId) record(state, state.sendConversationId).error = error;
      else state.error = "Could not create the chat. Please try again.";
      state.sendRequestId = null;
      state.sendConversationId = null;
    }),
});

const emptyMessages = [];
export const selectMessages = (state) => state.message.byConversation[state.conversation.selectedConversation?._id]?.items || emptyMessages;
export const selectArtifactMessages = (state) =>
  selectMessages(state).filter(
    (message) =>
      Array.isArray(message?.artifacts) && message.artifacts.length >= 1,
  );
export const selectArtifactEntries = (state) =>
  selectMessages(state).flatMap((message, messageIndex) =>
    Array.isArray(message?.artifacts)
      ? message.artifacts
          .filter((artifact) => Array.isArray(artifact?.files) && artifact.files.length >= 1)
          .map((artifact, artifactIndex) => ({
            id: String(artifact?.id || `${messageIndex}-${artifactIndex}`),
            artifact,
            message,
            messageIndex,
            artifactIndex,
          }))
      : [],
  );
export const selectActiveArtifact = (state) => {
  const entries = selectArtifactEntries(state);
  const entry =
    entries.find((item) => item.id === String(state.message.selectedArtifactId)) ||
    entries.at(-1);
  return entry?.artifact || null;
};
export const { setSelectedArtifact } = messageSlice.actions;
export default messageSlice.reducer;
