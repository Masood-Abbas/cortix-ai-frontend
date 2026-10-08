import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getMessages } from "./getMessages.js";
import { createConversation } from "./createConverstion.js";
import { updateConversation } from "./updateConversation.js";
import sendMessage from "./sendMessage.js";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../src/redux/conversationSlice.js";
import { setUserData } from "../src/redux/userSlice.js";

export const messageQueued = createAction("message/queued");

export const loadMessages = createAsyncThunk(
  "message/load",
  async (id, { signal }) => {
    const messages = await getMessages(id, signal);
    if (!Array.isArray(messages)) throw new Error("Invalid message history");
    return messages;
  },
  {
    condition: (id, { getState }) =>
      Boolean(id) && getState().message.sendConversationId !== id,
  },
);

export const sendChatMessage = createAsyncThunk(
  "message/send",
  async ({ prompt, conversationId ,agent,file}, { dispatch, getState, requestId }) => {
    const { selectionVersion, sessionVersion } = getState().conversation;
    const isCurrentSession = () =>
      getState().conversation.sessionVersion === sessionVersion;
    let conversation = getState().conversation.selectedConversation;
    if (!conversationId) {
      conversation = await createConversation();
      if (!isCurrentSession()) throw new Error("Session changed");
      if (!conversation?._id) throw new Error("Invalid conversation");
      conversationId = conversation._id;
      dispatch(addConversation(conversation));
    }
    if (!isCurrentSession()) throw new Error("Session changed");
    dispatch(messageQueued({ conversationId, prompt, requestId, file }));
    if (getState().conversation.selectionVersion === selectionVersion) {
      dispatch(setSelectedConversation(conversation));
    }

    if (conversation?.title === "New Chat") {
      try {
        const title = prompt.slice(0, 40);
        await updateConversation({ id: conversationId, title });
        if (isCurrentSession())
          dispatch(setConvTitle({ conversationId, title }));
      } catch (error) {
        console.log(error);
      }
    }
    if (!isCurrentSession()) throw new Error("Session changed");
    const response = await sendMessage({ prompt, conversationId,agent,file });
    const content = typeof response === "string" ? response : response?.content;
    if (typeof content !== "string" || !content.trim())
      throw new Error("Empty response");
    if (response?.user) dispatch(setUserData(response.user));
    return {
      conversationId,
      content,
      images: Array.isArray(response?.images) ? response.images : [],
      artifacts: Array.isArray(response?.artifacts) ? response.artifacts : [],
      files: Array.isArray(response?.files) ? response.files : [],
    };
  },
  {
    condition: ({ prompt, conversationId, file }, { getState }) => {
      const state = getState();
      return (
        (Boolean(prompt?.trim()) || Boolean(file)) &&
        Boolean(state.user.userData) &&
        !state.message.sendRequestId &&
        !state.message.byConversation[conversationId]?.loading &&
        !state.message.byConversation[conversationId]?.error
      );
    },
  },
);
