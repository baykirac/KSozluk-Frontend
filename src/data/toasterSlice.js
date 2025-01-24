// burası da store yapısına taşınacak
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    severity: "info",
    summary: "Confirmed",
    detail: "You have accepted",
    life: 3000,
};

export const toasterSlice = createSlice({
  name: "description",
  initialState,
  reducers: {
    showInfo: (state, action) => {
      state.severity = "warn"
      state.summary = "Başarısız"
      state.detail = action.payload.message
      // eslint-disable-next-line no-undef
      life = 3000
    },
    showWarn: (state, action) => {
        state.descriptions = action.payload.descriptions;
      },
  },
});

export const { setDescriptions } = toasterSlice.actions;
export default toasterSlice.reducer;
