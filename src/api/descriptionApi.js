import descriptionSlice from "../data/descriptionSlice";
import api from "./api";

const descriptionApi = {
    GetDescriptions: async (wordid) => await api.get("Description/GetDescriptions", {wordid}),
    DeleteDescription: async (descriptionId) => await api.post("Description/DeleteDescription", {descriptionId}),
    UpdateOrder: async (descriptionId, order) => await api.post("Description/UpdateOrder", {descriptionId, order}),
    UpdateStatus: async (descriptionId, status, rejectionReasons) => await api.post("Description/UpdateStatus", {descriptionId, status, rejectionReasons}),
    RecommendDescription: async (wordId, previousDescriptionId, content) => await api.post("Description/RecommendDescription", {wordId, previousDescriptionId, content}),
    LikeDescription: async (descriptionId) =>  await api.post("Description/DescriptionLike", {descriptionId}),
    FavouriteWord: async (wordId) =>  await api.post("Description/FavouriteWord", {wordId}),
    HeadersDescription: async (wordContent) => await api.post("Description/HeadersDescription", {wordContent}),
   
}

export default descriptionApi;