import React, {useRef} from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/OverlayPanel";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";

import "../styles/Header.css";

function Header() {
  const userInfo = {
    name: "Mehmet Burkay Kıraç",
    email: "kiracmehmetburkay@gmail.com",
  };
  const op = useRef(null);
  return (
    <header className="custom-header">
      <div className="header-left">
        <img src="logo.png" alt="Logo" className="header-logo" />
        <h2 style={{ color: "#192857"}}>
          Kavramlar Sözlüğü
        </h2>
      </div>
      <div className="header-right">
      <Button 
                icon="pi pi-user" 
                onClick={(e) => op.current.toggle(e)} 
                aria-label="User Info"
                className="user-info-button"
                tooltip="Kullanıcı Bilgileri"
                tooltipOptions={{showDelay: 250, position: 'left'}}
            />

            <OverlayPanel ref={op}>
                <Card title="Kullanıcı Bilgileri">
                    <Avatar icon="pi pi-user" size="large" shape="circle" />
                    <p><strong>Ad Soyad:</strong> {userInfo.name}</p>
                    <p><strong>E-posta:</strong> {userInfo.email}</p>
                </Card>
            </OverlayPanel>
      </div>
    </header>
  );
}

export default Header;
