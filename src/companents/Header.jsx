import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { InputSwitch } from "primereact/inputswitch";

import { signOut } from "../services/userService";

import "../styles/Header.css";

import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const { isAuthenticated, user, revoke } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const op = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const isLoginPage = location.pathname === "/SignIn";

  useEffect(() => {
    if (!isLoginPage) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.body.classList.remove('dark');
      }
    } else {
      // Login sayfasında her zaman light tema
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, [isLoginPage]);

  const toggleTheme = () => {
    if (!isLoginPage) {
      setIsDarkMode(!isDarkMode);
      if (isDarkMode) {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  };

  function handleSignOut() {
    revoke();
    signOut();
    navigate("/SignIn");
  }

  function handleGoToAdmin(){
    navigate("/AdminPage");
  }

  function handleLogin() {
    navigate("/SignIn");
  }

  return (
    <header className="custom-header">
      <div className="header-left">
        <a href="/"><img src="logo.png" alt="Logo" className="header-logo" /></a>
        <a href="/" style={{textDecoration: 'none'}}><h2>Kavramlar Sözlüğü</h2></a> 
      </div> 
      <div className="header-right">
      {!isLoginPage && (
          <div className="theme-toggle">
            <InputSwitch
              checked={isDarkMode}
              onChange={toggleTheme}
              tooltip={isDarkMode ? "Açık Tema" : "Koyu Tema"}
              tooltipOptions={{ position: 'left' }}
            />
          </div>
        )}
        {isAuthenticated ? (
          <>
            <Button
              icon="pi pi-user"
              onClick={(e) => op.current.toggle(e)}
              aria-label="User Info"
              className="user-info-button"
              tooltip="Kullanıcı Bilgileri"
              tooltipOptions={{ showDelay: 250, position: "left" }}
            />

            <OverlayPanel ref={op}>
              <Card title="Kullanıcı Bilgileri">
                <Avatar icon="pi pi-user" size="large" shape="circle" />
                <p>
                  <strong>Ad Soyad:</strong> {user.name}
                </p>
                <p>
                  <strong>E-posta:</strong> {user.email}
                </p>
                <p>
                  <strong>Yetki:</strong>{" "}
                  {user.role === "2" ? "Admin" : "Kullanıcı"}
                </p>
                {user.role === "2" ? (
                  <Button
                    label="Admin Paneli"
                    icon="pi pi-cog"
                    style={{marginRight: '1rem'}}
                    onClick={handleGoToAdmin}
                  />
                ) : (
                  <></>
                )}
                <Button
                  label="Çıkış Yap"
                  icon="pi pi-sign-out"
                  className="p-button-danger"
                  onClick={handleSignOut}
                />
              </Card>
            </OverlayPanel>
          </>
        ) : (
          <>
            <Button
              icon="pi pi-user"
              onClick={(e) => op.current.toggle(e)}
              aria-label="User Info"
              className="user-info-button"
              tooltip="Kullanıcı Bilgileri"
              tooltipOptions={{ showDelay: 250, position: "left" }}
            />
            <OverlayPanel ref={op}>
              <Card>
                <Button
                  label="Giriş Yap"
                  icon="pi pi-sign-in"
                  className="p-button-blue"
                  onClick={handleLogin}
                />
              </Card>
            </OverlayPanel>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;