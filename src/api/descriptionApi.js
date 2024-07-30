import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const descriptionApi = {
    GetDescriptions: async (wordid) => await api.get("Description/GetDescriptions", {wordid}),
    DeleteDescription: async (descriptionId) => await api.post("Description/DeleteDescription", {descriptionId})
}

export default descriptionApi;