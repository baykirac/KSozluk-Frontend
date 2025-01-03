import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";

import Header from "../companents/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faMapMarkerAlt,
  faBook,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import { signIn } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { Toast } from "primereact/toast";
import "../styles/SignInPage.css";
import { useNavigate, Navigate } from "react-router-dom";

function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [elements, setElements] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, authenticate } = useAuth();

  const navigate = useNavigate();

  const toast = useRef(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const response = await signIn(username, password);
    if (response.isSuccess) {
      setLoading(false);
      navigate("/");
      authenticate();
    } else {
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: response.message,
        life: 3000,
      });
      setLoading(false);
    }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const icons = [faMap, faMapMarkerAlt, faBook, faPen];

  const gridRows = 10;
  const gridCols = 20;

  const generateElements = () => {
    const elements = [];
    const usedPositions = new Set();

    for (let i = 0; i < gridRows * gridCols; i++) {
      const isLetter = Math.random() > 0.75;
      const content = isLetter
        ? alphabet[Math.floor(Math.random() * alphabet.length)]
        : icons[Math.floor(Math.random() * icons.length)];

      let row, col;
      do {
        row = Math.floor(Math.random() * gridRows);
        col = Math.floor(Math.random() * gridCols);
      } while (usedPositions.has(`${row}-${col}`));

      usedPositions.add(`${row}-${col}`);

      // elements.push(
      //   <div
      //     key={i}
      //     className={`floating-element ${
      //       isLetter ? "floating-letter" : "floating-icon"
      //     }`}
      //     style={{
      //       top: `${row * (100 / gridRows)}%`,
      //       left: `${col * (100 / gridCols)}%`,
      //       transform: `rotate(${(i * 17) % 360}deg)`,
      //       fontSize: `${((i % 3) + 2) * 8}px`,
      //     }}
      //   >
      //     {isLetter ? content : <FontAwesomeIcon icon={content} />}
      //   </div>
      // );
    }
    setElements(elements);
  };

  useEffect(() => {
    generateElements();
  }, []);

  return (
    <div className="content-signin-div">
      <Toast ref={toast} />
      {/* <Header /> */}
      <div className="signin-background">{elements}</div>
      <div className="login-page">
        <div className="login-card animate__animated animate__fadeInLeft">
          <div className="left-section">
            <div>
              <img
                src="basarsoft-logo-beyaz.png"
                style={{ width: "20rem", paddingRight: "2rem" }}
              />
              <div style={{ paddingRight: "1rem", color: "white" }}>
                <h2>Kavramlar Sözlüğü</h2>
                <h2>Giriş Ekranı</h2>
              </div>
            </div>
          </div>
          <div className="right-section">
            <form className="signin-form" onSubmit={handleLogin}>
              <div className="p-field" style={{ color: "white" }}>
                <label htmlFor="email" className="p-d-block">
                  Email
                </label>

                <InputText
                  style={{ width: "17rem" }}
                  id="email"
                  type="email"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="p-field" style={{ color: "white" }}>
                <label htmlFor="password" className="p-d-block">
                  Password
                </label>

                <Password
                  toggleMask
                  id="password"
                  feedback={false}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="p-field">
                <Button
                  label="Giriş Yap"
                  loading={loading}
                  className="p-mt-2"
                  onClick={handleLogin}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      {isAuthenticated && <Navigate to="/" />}
    </div>
  );
}

export default SignInPage;
