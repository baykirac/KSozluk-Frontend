import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const descriptionApi = {
    GetDescriptions: async (wordid) => await api.get("Description/GetDescriptions", {wordid}),
    DeleteDescription: async (descriptionId) => await api.post("Description/DeleteDescription", {descriptionId}),
    UpdateOrder: async (descriptionId, order) => await api.post("Description/UpdateOrder", {descriptionId, order}),
    UpdateStatus: async (descriptionId, status) => await api.post("Description/UpdateStatus", {descriptionId, status})
}

export default descriptionApi;