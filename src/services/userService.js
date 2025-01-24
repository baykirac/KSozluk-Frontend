import userApi from "../api/userApi.js";

export async function signIn(email, password) {
  const response = await userApi.signIn(email, password);

  if (response.isSuccess) {
    localStorage.setItem("accessToken", response.body.accessToken);
    localStorage.setItem("refreshToken", response.body.refreshToken);

    // notification set et
  } else if (response.message) {
    // notification set et
  }
  return response;
}

export function signOut() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

