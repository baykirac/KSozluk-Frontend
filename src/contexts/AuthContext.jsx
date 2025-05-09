import { createContext, useContext, useState, useEffect } from "react";
import { EnumPermissions } from "../data/userSlice"; 
export const AuthContext = createContext();
import { useNavigate } from "react-router-dom";

export function useAuth() {
  return useContext(AuthContext);
}

// eslint-disable-next-line react/prop-types
export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(true); 
  const [isSuperAdmin, setIsASuperAdmin] = useState(true);
  const navigate = useNavigate();

  const login = (() => {
    const user = localStorage.getItem("user");
    const oztToken = localStorage.getItem("oztToken");

    if (user && oztToken) {
      setUser(JSON.parse(user));
      setIsAuthenticated(true);
      const userRoles = window.Object.checkPermissions([
        EnumPermissions.admin,
        EnumPermissions.superadmin
      ]); 
      const userSuperAdmin = window.Object.checkPermissions([
        EnumPermissions.superadmin
      ]);    
      setIsInputDisabled(!userRoles);
      setIsASuperAdmin(!userSuperAdmin);
    }else {
      setIsAuthenticated(false);
    }
  }); 

  useEffect(() => {
    login(); 
  }, []);
 
   function handleSignOut() {
      localStorage.removeItem("oztToken");
      localStorage.removeItem("user")
      setUser(null); 
      navigate("/LoginPage");
    }


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isInputDisabled,
        isSuperAdmin,
        handleSignOut,
        login
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}