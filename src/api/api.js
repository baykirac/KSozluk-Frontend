import axios from "axios";
import { toast } from "react-toastify";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Axios Interceptor: Tüm isteklerde `oztToken` header olarak ekleniyor
ax.interceptors.request.use(
  function (config) {
    config.headers["Content-Type"] = "application/json";

    const oztToken = localStorage.getItem("oztToken");
    if (oztToken) {
      config.headers["ozt"] = oztToken;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Axios Interceptor: Yanıtları yönetme
ax.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 429) {
      toast.error(
        error.response.data.message || "Çok fazla istek gönderildi. Lütfen biraz bekleyin."
      );
    } else {
      toast.error("Bilinmeyen bir hata oluştu!");
    }

    return Promise.reject(error);
  }
);

// API fonksiyonları
const api = {
  get: async function (path, params = {}) {
    try {
      const response = await ax.get(path, { params });
      return parseApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  post: async function (path,body) {
    try {
      const response = await ax.post(path, JSON.stringify(body));
      return parseApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API Yanıtını işleme
function parseApiResponse(response) {
  return {
    success: response.data.success,
    message: response.data.message,
    body: response.data.data,
  };
}

// Hata yönetimi
function handleApiError(error) {
  if (error.response?.status === 429) {
    return {
      success: false,
      isRateLimit: true,
      message: error.response.data.message,
    };
  }

  return {
    success: false,
    message: "Bilinmeyen bir hata oluştu!",
  };
}

export default api;
