import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  descriptions: [],
  selectedDescriptionId: "",
  recommendMode: null,
  selectedDescription: null,
};

export const descriptionSlice = createSlice({
  name: "description",
  initialState,
  reducers: {
    setDescriptions: (state, action) => {
      state.descriptions = action.payload.descriptions;
    },
    setRecommendMode: (state, action) => {
      state.recommendMode = action.payload;
    },
    setSelectedDescription: (state, action) => {
      state.selectedDescription = action.payload;
    },
    setSelectedDescriptionId: (state, action) => {
      state.selectedDescriptionId = action.payload;
    },
  },
});

export const {
  setDescriptions,
  setRecommendMode,
  setSelectedDescription,
  setSelectedDescriptionId,
} = descriptionSlice.actions;
export default descriptionSlice.reducer;
