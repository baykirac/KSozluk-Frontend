export async function saveUserData(data) {
  localStorage.setItem("oztToken", data.token);
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

export function outUserData() {
  localStorage.removeItem("oztToken");
}

