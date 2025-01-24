import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: '',
    email: '',
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInformation: (state, action) => {
      state.name = action.payload.username;
      state.email = action.payload.password;
    }
  },
});

export const {
  setUserInformation,
} = userSlice.actions;
export default userSlice.reducer;
