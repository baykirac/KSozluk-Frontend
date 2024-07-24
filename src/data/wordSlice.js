import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paginatedWords: [
    { letter: "A", wordContents: [] },
    { letter: "B", wordContents: [] },
    { letter: "C", wordContents: [] },
    { letter: "D", wordContents: [] },
    { letter: "E", wordContents: [] },
    { letter: "F", wordContents: [] },
    { letter: "G", wordContents: [] },
    { letter: "H", wordContents: [] },
    { letter: "I", wordContents: [] },
    { letter: "J", wordContents: [] },
    { letter: "K", wordContents: [] },
    { letter: "L", wordContents: [] },
    { letter: "M", wordContents: [] },
    { letter: "N", wordContents: [] },
    { letter: "O", wordContents: [] },
    { letter: "P", wordContents: [] },
    { letter: "Q", wordContents: [] },
    { letter: "R", wordContents: [] },
    { letter: "S", wordContents: [] },
    { letter: "T", wordContents: [] },
    { letter: "U", wordContents: [] },
    { letter: "V", wordContents: [] },
    { letter: "W", wordContents: [] },
    { letter: "X", wordContents: [] },
    { letter: "Y", wordContents: [] },
    { letter: "Z", wordContents: [] },
  ]
};

export const wordSlice = createSlice({
  name: "word",
  initialState,
  reducers: {
    setCurrentWords(state, action) {
      const { currentLetter, allWords } = action.payload;
      const letterItem = state.paginatedWords.find(item => item.letter === currentLetter);
      if (letterItem) {
        letterItem.wordContents = allWords;
      }
    },
  },
});

export const { setCurrentWords } = wordSlice.actions;
export default wordSlice.reducer;
