import axios from "axios"

const ax = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

const api = {
    get: async function (path, params = {}) {
      try {
        const response = await ax.get(path, {
          params,
        });
  
        return parseApiResponse(response);
      } catch (e) {
        console.error(e);
        return {
          isSuccess: false,
          message: "Bilinmeyen bir hata oluştu!",
        };
      }
    },
    post: async function (path, body) {
      try {
        const response = await ax.post(path, body);
  
        return parseApiResponse(response);
      } catch (e) {
        console.error(e);
  
        return {
          isSuccess: false,
          message: "Bilinmeyen bir hata oluştu!",
        };
      }
    },
  };

  function parseApiResponse(response) {
    const isSuccess = response.data.header.isSuccess;
    const message = response.data.header.message;
    const validationMessages = response.data.header.validationMessages;
    const body = response.data.body;
  
    return {
      isSuccess,
      message,
      validationMessages,
      body,
    };
  }
  
  export default api;