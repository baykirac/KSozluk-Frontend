import { Routes, Route, Navigate} from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import Documentation from "./pages/Documantation"; 
import { PrimeReactProvider } from "primereact/api";
import AuthProvider from "./contexts/AuthContext";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "animate.css";
import { Provider } from "react-redux";
import { store } from "./data/store";
import CryptoJS from "crypto-js";
import UserDoc from "./pages/UserDoc";

  function App() {
    return (
      <AuthProvider>
        <PrimeReactProvider>
          <Provider store={store}>
            <Routes>
              <Route path="/" element={<Navigate to="/LoginPage" replace />} />
              <Route path="/LoginPage" element={<LoginPage/>} />
              <Route path="/HomePage" element={<HomePage />} />
              <Route path="/AdminPage" element={<AdminPage />} />
              <Route path="/Documentation" element={<Documentation />} />
              <Route path="/UserDocumantation" element={<UserDoc />} />
            </Routes>
          </Provider>
        </PrimeReactProvider>
      </AuthProvider>
    );
  }
  window.Object.checkPermissions = (permissions) => {
    const userData = JSON.parse(
      // eslint-disable-next-line no-undef
      localStorage.getItem("user")
    );
    if (!userData || !userData.permissions) {
      return false;
    }
  
    return permissions.some((permission) =>
      userData.permissions.includes(
        CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(permission))
      )
    );
  };

export default App;
