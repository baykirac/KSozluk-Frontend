import { configureStore } from "@reduxjs/toolkit";
import wordReducer from "./wordSlice";
import userReducer from "./userSlice";
import descriptionReducer from "./descriptionSlice";
export const store = configureStore({
  reducer: {
    words: wordReducer,
    descriptions: descriptionReducer,
    user: userReducer
  },
  
});
