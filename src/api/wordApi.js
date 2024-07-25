import api from "./api";

const wordApi = {
    GetWordsByLetter: async (letter, pageNumber, pageSize) => await api.get("Word/GetWordsByLetter", {letter, pageNumber, pageSize}),
    GetWordsByContains: async (content) => await api.get("Word/GetWordsByContains", {content})
}

export default wordApi;