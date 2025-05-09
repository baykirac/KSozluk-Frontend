import api from "./api";

const userApi = {  
   GetUserAll : async ( PageNumber, PageSize) => await api.get("Users/GetAllUsers", {PageNumber, PageSize}),

   UpdateUserRole : async (userId, newRoleAndPermissionId) => await api.post("Users/UpdateUserRole", { userId, newRoleAndPermissionId})
};

export default userApi;