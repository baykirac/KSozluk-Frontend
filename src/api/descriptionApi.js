import axios from "axios";
import api from "./api";

const accessToken = localStorage.getItem("accessToken");

const descriptionApi = {
  GetDescriptions: async (wordid) =>
    await api.get("Description/GetDescriptions", { wordid }),

  DeleteDescription: async (descriptionId) =>
    await api.post("Description/DeleteDescription", { descriptionId }),

  UpdateOrder: async (descriptionId, order) =>
    await api.post("Description/UpdateOrder", { descriptionId, order }),

  UpdateStatus: async (
    descriptionId,
    status,
    rejectionReasons,
    customRejectionReason
  ) =>

    await api.post("Description/UpdateStatus", {
      descriptionId,
      status,
      rejectionReasons,
      customRejectionReason,
    }),

  RecommendDescription: async (wordId, previousDescriptionId, content) =>
    await api.post("Description/RecommendDescription", {
      wordId,
      previousDescriptionId,
      content,
    }),

  LikeDescription: async (descriptionId) =>
    await api.post("Description/DescriptionLike", { descriptionId }),

  FavouriteWord: async (wordId) =>
    await axios.post(
      import.meta.env.VITE_API_URL + "Description/FavouriteWord",
      { wordId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    ),

  HeadersDescription: async (wordContent) =>
    await api.post("Description/HeadersDescription", { wordContent }),

  FavouriteWordsOnScreen: async () =>
    await api.post("Description/FavouriteWordsOnScreen", {}),

  DescriptionTimeline: async () =>
    await api.post("Description/DescriptionTimeline", {}),
};

export default descriptionApi;
