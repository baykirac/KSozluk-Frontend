import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paginatedWords: [
    { letter: "A", wordContents: [] },
    { letter: "B", wordContents: [] },
    { letter: "C", wordContents: [] },
    { letter: "Ç", wordContents: [] },
    { letter: "D", wordContents: [] },
    { letter: "E", wordContents: [] },
    { letter: "F", wordContents: [] },
    { letter: "G", wordContents: [] },
    { letter: "H", wordContents: [] },
    { letter: "I", wordContents: [] },
    { letter: "İ", wordContents: [] },
    { letter: "J", wordContents: [] },
    { letter: "K", wordContents: [] },
    { letter: "L", wordContents: [] },
    { letter: "M", wordContents: [] },
    { letter: "N", wordContents: [] },
    { letter: "O", wordContents: [] },
    { letter: "Ö", wordContents: [] },
    { letter: "P", wordContents: [] },
    { letter: "R", wordContents: [] },
    { letter: "S", wordContents: [] },
    { letter: "Ş", wordContents: [] },
    { letter: "T", wordContents: [] },
    { letter: "U", wordContents: [] },
    { letter: "Ü", wordContents: [] },
    { letter: "V", wordContents: [] },
    { letter: "Y", wordContents: [] },
    { letter: "Z", wordContents: [] },
  ],
  selectedWordId: ""
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
    setSelectedWordId(state,action){
      const wordId = action.payload;
      state.selectedWordId = wordId;
    }
  },
});

export const { setCurrentWords, setSelectedWordId } = wordSlice.actions;
export default wordSlice.reducer;
