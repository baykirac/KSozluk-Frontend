import { createContext, useContext, useState, useEffect } from "react";
import { EnumPermissions } from "../data/userSlice"; 
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// eslint-disable-next-line react/prop-types
export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(true); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const oztToken = localStorage.getItem("oztToken");

    if (storedUser && oztToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      const userRoles = window.Object.checkPermissions([
        EnumPermissions.admin,
    ]);
      
      setIsInputDisabled(!userRoles);
    }else {
      setIsAuthenticated(false);
    }
  }, []); 


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isInputDisabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}