import React, { useState } from "react";
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

import "../styles/SignInPage.css";

function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // giriş yapma işlemleri
  };

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

      elements.push(
        <div
          key={i}
          className={`floating-element ${
            isLetter ? "floating-letter" : "floating-icon"
          }`}
          style={{
            top: `${row * (100 / gridRows)}%`,
            left: `${col * (100 / gridCols)}%`,
            transform: `rotate(${(i * 17) % 360}deg)`,
            fontSize: `${((i % 3) + 2) * 8}px`,
          }}
        >
          {isLetter ? content : <FontAwesomeIcon icon={content} />}
        </div>
      );
    }
    return elements;
  };

  return (
    <div className="content-signin-div">
      <Header />
      <div className="signin-background">{generateElements(200)}</div>
      <div className="login-page">
        <div className="login-card animate__animated animate__fadeInLeft">
          <div className="left-section">
            <div>
              <img
                src="logo.png"
                style={{ width: "18rem", paddingRight: "4rem" }}
              />
              <div style={{ paddingRight: "3rem" }}>
                <h2>Kavramlar Sözlüğü</h2>
                <h2>Giriş Ekranı</h2>
              </div>
            </div>
          </div>
          <div className="right-section">
            <form className="signin-form">
              <div className="p-field">
                <label htmlFor="email" className="p-d-block">
                  Email
                </label>
                <span className="p-input-icon-left">
                  <i className="pi pi-envelope" style={{marginLeft:20}} />
                  <InputText style={{width: '17rem'}} id="email" type="email" />
                </span>
              </div>
              <div className="p-field">
                <label htmlFor="password" className="p-d-block">
                  Password
                </label>
                <span className="p-input-icon-left">
                  <i className="pi pi-lock" style={{zIndex:1, marginLeft:20}}  />
                  <Password toggleMask id="password" feedback={false} />
                </span>
              </div>
              <div className="p-field">
                <Button label="Sign In" className="p-mt-2" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
