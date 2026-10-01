import { createSlice } from "@reduxjs/toolkit";

export const getUserId = (data) => data?._id || data?.userId || data?.user?._id || null;

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    revision: 0,
  },
  reducers: {
    setUserData: (state, action) => {
      const data = action.payload?.user || action.payload;
      state.userData = data ? { ...data, _id: getUserId(action.payload) } : null;
      state.revision += 1;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
