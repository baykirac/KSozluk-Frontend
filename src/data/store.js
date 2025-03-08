import { configureStore } from "@reduxjs/toolkit";
import wordReducer from "./wordSlice";
import descriptionReducer from "./descriptionSlice";
export const store = configureStore({
  reducer: {
    words: wordReducer,
    descriptions: descriptionReducer,
  },
});
