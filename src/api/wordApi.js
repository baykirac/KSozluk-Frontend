//Bu kısımlarda da bazı Slice işlemleri yapılabilir
//import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const wordApi = {
  GetWordsByLetter: async (letter, pageNumber, pageSize) =>
    await api.get("Word/GetWordsByLetter", { letter, pageNumber, pageSize }),
  GetWordsByContains: async (content) =>
    await api.get("Word/GetWordsByContains", { content }),
  AddWord: async (obj) =>
    await api.post("Word/AddWord", {
      WordContent: obj.WordContent,
      Description: obj.Description
    }),

  AddWords: async (wordcontent) =>
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
  RecommendWord: async (obj) =>
    await api.post("Word/RecommendWord", {
      wordContent: obj.WordContent,
      descriptionContent: obj.DescriptionContent
    }),
  LikeWord: async (wordId) => await api.post("Word/LikeWord", {wordId}),
  GetTopList: async () => await api.get("Word/WeeklyLiked", {}),
  UpdateWordById: async (wordId, wordContent) =>
    await api.post("Word/UpdateWordById", {
      wordId,
      wordContent,
    }),

};

export default wordApi;
