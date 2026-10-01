import { createSlice } from "@reduxjs/toolkit";
import { getUserId, setUserData } from "./userSlice.js";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation:null,
    selectionVersion: 0,
    sessionVersion: 0,
    ownerId: null,
  },
  reducers: {
     setConversations:(state,action)=>{
        if (!Array.isArray(action.payload)) return;
        const fetchedIds = new Set(action.payload.map((conv) => conv._id));
        state.conversations = [
          ...state.conversations.filter((conv) => !fetchedIds.has(conv._id)),
          ...action.payload,
        ];
     },
     addConversation:(state,action)=>{
        state.conversations.unshift(action.payload)
     },
     setSelectedConversation:(state,action)=>{
        state.selectedConversation=action.payload
        state.selectionVersion += 1
     },
     setConvTitle:(state,action)=>{
      const {title,conversationId}=action.payload
      state.conversations=state.conversations.map((conv)=>(
         conv._id===conversationId?({...conv,title}):conv
      ))

     if (state.selectedConversation?._id== conversationId){
      state.selectedConversation={...state.selectedConversation,title}
     }
     }

  },
  extraReducers: (builder) => builder.addCase(setUserData, (state, { payload }) => {
    const ownerId = getUserId(payload);
    if (state.ownerId !== ownerId) {
      state.ownerId = ownerId;
      state.conversations = [];
      state.selectedConversation = null;
      state.selectionVersion += 1;
      state.sessionVersion += 1;
    }
  }),
});

export const { setConversations,addConversation,setSelectedConversation,setConvTitle } = conversationSlice.actions;
export default conversationSlice.reducer;
