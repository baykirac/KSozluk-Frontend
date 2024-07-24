import api from "./api";

const wordApi = {
    GetWordsByLetter: async (letter, pageNumber, pageSize) => await api.post("Word/GetWordsByLetter", {letter, pageNumber, pageSize}),
}

export default wordApi;