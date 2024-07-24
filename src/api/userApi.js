import api from "./api";

const userApi = {
    signIn: async (email, password) => await api.post("User/SignIn", {email,password}),
}

export default userApi;