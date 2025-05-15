import api from "./api";

const userApi = {  
   GetUserAll : async ( PageNumber, PageSize, filters = {}) => await api.get("Users/GetAllUsers", {PageNumber, PageSize, ...filters}),

   UpdateUserRole : async (userId, newRoleAndPermissionId) => await api.post("Users/UpdateUserRole", { userId, newRoleAndPermissionId})
};

export default userApi;