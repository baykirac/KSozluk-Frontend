import api from "./api";

const descriptionApi = {
    GetDescriptions: async (wordid) => await api.get("Description/GetDescriptions", {wordid}),
}

export default descriptionApi;