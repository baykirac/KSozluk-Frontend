import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const wordApi = {
    GetWordsByLetter: async (letter, pageNumber, pageSize) => await api.get("Word/GetWordsByLetter", {letter, pageNumber, pageSize}),
    GetWordsByContains: async (content) => await api.get("Word/GetWordsByContains", {content}),
    AddWord: async (wordcontent, description) => await api.post("Word/AddWord", {wordcontent, description})
}

export default wordApi;