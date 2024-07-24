import { Routes, Route, Router } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import "./App.css";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";

import { PrimeReactProvider } from "primereact/api";
import AuthProvider from "./contexts/AuthContext";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import "animate.css";
import { Provider } from "react-redux";
import { store } from "./data/store";

function App() {
  return (
    <AuthProvider>
      <PrimeReactProvider>
        <Provider store={store}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/AdminPage" element={<AdminPage />} />
            <Route path="/SignIn" element={<SignInPage />} />
          </Routes>
        </Provider>
      </PrimeReactProvider>
    </AuthProvider>
  );
}

export default App;
