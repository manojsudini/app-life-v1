import React from "react";
import { getSessionUser, loginUser, logoutUser, registerUser, updateUserProfile } from "../utils/appData";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = React.useState(() => getSessionUser());

  React.useEffect(() => {
    const syncSession = () => {
      setCurrentUser(getSessionUser());
    };

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const login = React.useCallback((values) => {
    const user = loginUser(values);
    setCurrentUser(user);
    return user;
  }, []);

  const register = React.useCallback((values) => {
    const user = registerUser(values);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = React.useCallback(() => {
    logoutUser();
    setCurrentUser(null);
  }, []);

  const refreshUser = React.useCallback(() => {
    setCurrentUser(getSessionUser());
  }, []);

  const updateProfile = React.useCallback(
    (values) => {
      const updatedUser = updateUserProfile(values, currentUser);
      setCurrentUser(updatedUser);
      return updatedUser;
    },
    [currentUser]
  );

  const contextValue = React.useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [currentUser, login, register, logout, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

