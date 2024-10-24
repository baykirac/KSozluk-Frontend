import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const wordApi = {
  GetWordsByLetter: async (letter, pageNumber, pageSize) =>
    await api.get("Word/GetWordsByLetter", { letter, pageNumber, pageSize }),
  GetWordsByContains: async (content) =>
    await api.get("Word/GetWordsByContains", { content }),
  AddWord: async (wordcontent, description) =>
    await api.post("Word/AddWord", { wordcontent, description }),
  AddWords: async (wordcontent, description) =>
    await api.post("Word/AddWords", { wordcontent }),
  GetAllWords: async () => await api.get("Word/GetAllWords"),
  GetApprovedWordsPaginated: async (pageNumber, pageSize) =>
    await api.get("Word/GetApprovedWordsPaginated", { pageNumber, pageSize }),
  UpdateWord: async (wordId, descriptionId, wordContent, descriptionContent) =>
    await api.post("Word/UpdateWord", {
      wordId,
      descriptionId,
      wordContent,
      descriptionContent,
    }),
  DeleteWord: async (wordId) => await api.post("Word/DeleteWord", { wordId }),
  RecommendWord: async (wordContent, descriptionContent) => await api.post("Word/RecommendWord", {wordContent, descriptionContent}),
  LikeWord: async (wordId) => await api.post("Word/LikeWord", {wordId})

};

export default wordApi;
