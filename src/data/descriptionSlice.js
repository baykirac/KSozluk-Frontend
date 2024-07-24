import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  descriptions: []
};

export const descriptionSlice = createSlice({
  name: "description",
  initialState,
  reducers: {
    setDescriptions: (state, action) => {
      state.descriptions = action.payload.descriptions;
    },
  },
});

export const { setDescriptions } = descriptionSlice.actions;
export default descriptionSlice.reducer;
