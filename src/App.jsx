import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import "./App.css";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";

import { PrimeReactProvider } from "primereact/api";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import 'animate.css';

function App() {
  

  return (
    <PrimeReactProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/AdminPage" element={<AdminPage />} />
        <Route path="/SignIn" element={<SignInPage />} />
      </Routes>
    </PrimeReactProvider>
  );
}

export default App;
