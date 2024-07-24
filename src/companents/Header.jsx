import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/OverlayPanel";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";

import { signOut } from "../services/userService";

import "../styles/Header.css";

import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { isAuthenticated, user, revoke } = useAuth();
  
  const navigate = useNavigate();

  function handleSignOut() {
    revoke();
    signOut();
    navigate("/SignIn");
  }

  function handleLogin() {
    navigate("/SignIn");
  }
  const op = useRef(null);


  return (
    <header className="custom-header">
      <div className="header-left">
        <img src="logo.png" alt="Logo" className="header-logo" />
        <h2 style={{ color: "#192857" }}>Kavramlar Sözlüğü</h2>
      </div>
      <div className="header-right">
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
