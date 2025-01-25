import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Dialog } from "primereact/dialog";
import { signOut } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Searcher from "./Searcher";
import WordOperationMeaning from "./WordOperationMeaning";
import descriptionApi from "../api/descriptionApi";
import "../styles/Header.css";

// eslint-disable-next-line react/prop-types
function Header({ onSearch }) {
  const { isAuthenticated, user, revoke } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const op = useRef(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [timelineModal, setTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  

  const isAdminPage = location.pathname === "/AdminPage";

  const isLoginPage = location.pathname === "/SignIn";


  useEffect(() => {
    document.body.classList.add("dark");
    getTimeline();
  }, [isLoginPage]);

  const getTimeline = async () => {
    try {
      const response = await descriptionApi.DescriptionTimeline();
      if (response.isSuccess) {
        setTimelineData(response.body);
      }
    } catch (error) {
      console.error("Timeline fetch error:", error);
    }
  };

  function handleSignOut() {
    revoke();
    signOut();
    navigate("/SignIn");
  }

  function handleGoToAdmin() {
    navigate("/AdminPage");
  }

  function handleLogin() {
    navigate("/SignIn");
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(true);
    }
  };

  const closingModalF = () => {
    setOpenModal(false);
  };

  const infoModalContent = (
    <div>
      <h2>Kavramlar Sözlüğü Nedir?</h2>
      <p>
        Kavramlar sözlüğü şirkete dahil olan yeni ekip arkadaşlarımızın
        oryantasyon sürecini hızlandırıp kavramları benimsetmek amacıyla veya
        disiplinler arası çalışan çalışanlarımıza kolaylık sağlamak amacıyla
        oluşturulmuş bir uygulamadır.
      </p>
      <h2>Neler Yapabilirim?</h2>
      <p>
        Sözlükte bulunan tüm kelimeleri alfabetik olarak görüntüleyebilir,
        kelime arayabilir, yeni kelime önerebilir, yeni kelimeye yeni anlam
        önerebilir veya mevcutta olan anlamlara öneride bulunabilirsiniz.
      </p>
    </div>
  );

  return (
    <header className="custom-header">
      <div className="header-left">
        <a href="/">
          <img
            src="basarsoft-logo-beyaz.png"
            alt="Logo"
            className="header-logo"
          />
        </a>
        <a href="/" className="no-underline"></a>
        <a href="/" style={{ textDecoration: "none" }}>
          <h2>Kavramlar Sözlüğü</h2>
        </a>
      </div>

      <div className="header-right">
        {!isLoginPage && (
          <>
            {!isAdminPage && (
              <Searcher
                isSearched={handleSearch}
                forModal={false}
                searchedWordF={(word) => onSearch && onSearch(true, word)}
                searchedWordIdF={(id) =>
                  onSearch && onSearch(true, undefined, id)
                }
                word=""
                setTheWordF={() => {}}
                forAdmin={false}
                isDisabled={false}
              />
            )}
            {/* <div className="theme-toggle">
              <InputSwitch
                checked={isDarkMode}
                onChange={toggleTheme}
                tooltip={isDarkMode ? "Açık Tema" : "Koyu Tema"}
                tooltipOptions={{ position: "left" }}
              />
            </div> */}
            <Button
              icon="pi pi-question"
              className="p-button-rounded p-button-text info-button"
              onClick={() => setInfoModalVisible(true)}
              tooltip="Bilgi"
              tooltipOptions={{ position: "left" }}
            />
            <Button
              tooltip="Önerilerim"
              tooltipOptions={{ showDelay: 250, position: "left" }}
              icon="pi pi-calendar"
              className="floating-button"
              onClick={() => {
                setTimelineModal(true);
              }}
            />
          </>
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
                    style={{ marginRight: "1rem" }}
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
      <Dialog
        visible={infoModalVisible}
        style={{ width: "50vw" }}
        onHide={() => setInfoModalVisible(false)}
        dismissableMask={true}
        closeOnEscape={true}
      >
        {infoModalContent}
      </Dialog>
      <Dialog
    visible={timelineModal}
    style={{ width: "50vw" }}
    onHide={() => setTimelineModal(false)}
    dismissableMask={true}
    closeOnEscape={true}
    header="Önerilerim"
  >
    <div className="timeline-container">
      {timelineData.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-word">{item.wordContent}</div>
          <div className="timeline-description">{item.descriptionContent}</div>
          <div className={`step-parent status-${item.status}`}>
            <div className="step-container">             
              <div className="line"></div>
              <div className="circle">!</div>
              <div className="line"></div>
              <div className="name">Önerildi</div>
            </div>
            <div className="step-container">          
              <div className="line"></div>
              <div className="circle">?</div>
              <div className="line"></div>
              <div className="name">Değerlendiriliyor</div>
            </div>
            <div className="step-container">        
              <div className="line"></div>
              <div className="circle">
              {item.status === 1 ? '✓' : 
              item.status === 3 ? 'X' : '?'}
              </div>
              <div className="line"></div>
              <div className="name">
                {item.status === 1 ? 'Onaylandı' : 
                 item.status === 3 ? 'Reddedildi' : 'Bekliyor'}
            </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      ))}
    </div>
  </Dialog>

      <WordOperationMeaning
        visible={openModal}
        closingModal={closingModalF}
        isDisabled={false}
      />
    </header>
  );
}

export default Header;
