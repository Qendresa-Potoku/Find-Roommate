export const getUser = () => {
  const user = sessionStorage.getItem("user");
  if (!user || user === "undefined") return null;
  return JSON.parse(user);
};

export const setUserSession = (user, token) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("userId", user._id);
  sessionStorage.setItem("token", token);
};

export const resetUserSession = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("token");
};
