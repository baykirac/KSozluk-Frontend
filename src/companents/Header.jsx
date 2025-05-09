import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Dialog } from "primereact/dialog";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Searcher from "./Searcher";
import WordOperationMeaning from "./WordOperationMeaning";
import descriptionApi from "../api/descriptionApi";
import userApi from "../api/userApi";
import "../styles/Header.css";
import { Toast } from "primereact/toast";

// eslint-disable-next-line react/prop-types
function Header({ onSearch, isPosisitonFixed }) {
  const { isAuthenticated, isInputDisabled, handleSignOut, isSuperAdmin } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const op = useRef(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [timelineModal, setTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [superAdminData, setSuperAdminData] = useState({ items: []});
  const [superAdminTotalCount, setSuperAdminTotalCount] = useState({ totalCount: 0 });
  const [superAdminModal, setSuperAdminModal] = useState(false);
  const [superAdminTimesModal, setSuperAdminTimesModal] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [superAdminChecked, setSuperAdminChecked] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [superAdminPagination, setSuperAdminPagination] = useState({ pageNumber: 1, pageSize: 10 });

  const toast = useRef(null);

  const isAdminPage = location.pathname === "/AdminPage";

  const isHomePage = location.pathname === "/HomePage";

  const isLoginPage = location.pathname === "/LoginPage";

  const user = JSON.parse(localStorage.getItem("user"));

  const getRoleLabel = (roleId, permissionId) => {
    if (roleId === 1 && permissionId === 1) return "Admin";
    if (roleId === 2 && permissionId === 2) return "Kullanıcı";
    if (roleId === 3 && permissionId === 3) return "Süper Admin";
    return "Atanmamış";
  };


  useEffect(() => {
    if (superAdminChecked === true && pendingRoleChange !== null) {
      const { userId, roleId, permissionId } = pendingRoleChange;

      const updatedData = superAdminData.items.map((user) =>
        user.id === userId
          ? { ...user, roleId: roleId, permissionId: permissionId }
          : user
      );
      setSuperAdminData({ items: updatedData });
  
      updateUserRole(userId, roleId, permissionId);
  
      // Temizle
      setPendingRoleChange(null);
      setSuperAdminChecked(false);
    }
  }, [superAdminChecked]);
  

  const updateUserRole = async (userId, roleId, permissionId) => {
    try {
      let newRoleAndPermissionId;

      if (roleId === permissionId) {
        newRoleAndPermissionId = roleId;
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: "Rol bilgisi doğrulanmadı.",
        });
        return;
      }

      const response = await userApi.UpdateUserRole(
        userId,
        newRoleAndPermissionId
      );
      if (response.success) {
        toast.current.show({
          severity: "success",
          summary: "Başarılı",
          detail: response.message,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: "Değişiklik kaydedilemedi.",
        });
      }
    } catch (error) {
      console.error("API isteği başarısız:", error);
    }
  };

  useEffect(() => {
    document.body.classList.add("dark");
  }, [isLoginPage]);

  const getTimeline = async () => {
    try {
      const response = await descriptionApi.DescriptionTimeline();
      if (response.success) {
        setTimelineData(response.body);
      }
    } catch (error) {
      console.error("Timeline fetch error:", error);
    }
  };

  const getSuperAdminTimeline = async (pageNumber, pageSize) => {
    try {
      const response = await userApi.GetUserAll(pageNumber, pageSize);
      if (response.success) {
        const { body } = response;
        setSuperAdminData({
          items: body.items,
        });
        setSuperAdminTotalCount({
          totalCount: body.totalCount
        });
      }
    } catch (error) {
      console.error("Timeline fetch error:", error);
    }
  };

  const onPageChange = (e) => {
    const newPageNumber = e.page + 1;
    const newPageSize = e.rows;
  
    getSuperAdminTimeline(newPageNumber, newPageSize);

    setSuperAdminPagination({
      pageNumber: newPageNumber,
      pageSize: newPageSize,
    });
  };
  

  function handleGoToAdmin() {
    navigate("/AdminPage");
  }

  function handleLogin() {
    navigate("/LoginPage");
  }

  function handleAdminDoc() {
    navigate("/docs/Admin-Sayfası/Oneri-Degerlendir-Sayfasi");
  }
  const handleSearch = () => {
    if (onSearch) {
      onSearch(true);
    }
  };

  const closingModalF = () => {
    setOpenModal(false);
  };

  const rejectionReason = [
    { name: "Uygunsuz", value: 1 },
    { name: "Zaten Mevcut", value: 2 },
    { name: "Eksik Açıklama", value: 3 },
    { name: "Yanlış Tanım", value: 4 },
    { name: "Karmaşık veya Anlaşılmaz İfade", value: 5 },
    { name: "Birden Fazla Anlam", value: 6 },
    { name: "Diğer", value: 7 },
  ];

  const handleOpenRejectionDialog = async (
    reasonValue,
    customReason,
    descriptionId,
    isActive,
    index
  ) => {
    if (reasonValue === 7 && customReason) {
      setSelectedRejectionReason(customReason);
    } else {
      const foundReason = rejectionReason.find((r) => r.value === reasonValue);
      setSelectedRejectionReason(foundReason ? foundReason.name : "");
    }

    const newStatus = !isActive; // Yeni değeri tersine çevir

    setTimelineData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, isActive: newStatus } : item
      )
    );

    try {
      // API isteğini gönder
      const response = await descriptionApi.UpdateIsActive(
        descriptionId,
        (isActive = newStatus)
      );

      if (!response.success) {
        console.error("Güncelleme hatası:", response.message);
      }
    } catch (error) {
      console.error("API isteği başarısız:", error);
    }

    setShowRejectionDialog(true);
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
    <header
      className={`custom-header ${isPosisitonFixed ? "position-fixed" : ""}`}
    >
      <Toast ref={toast} />
      <div className="header-left">
        <a href="/HomePage">
          <img
            src="basarsoft-logo-beyaz.png"
            alt="Logo"
            className="header-logo"
          />
        </a>
        <a href="/HomePage" className="no-underline"></a>
        <a href="/HomePage" style={{ textDecoration: "none" }}>
          <h2>Kavramlar Sözlüğü</h2>
        </a>
      </div>

      <div className="header-right">
        {!isLoginPage && (
          <>
            {isAdminPage && (
              <>
                <Button
                  icon="pi pi-spin pi-cog"
                  className="p-button-rounded p-button-text info-button"
                  onClick={() => handleAdminDoc()}
                  tooltip="Dökümantasyon"
                  tooltipOptions={{ position: "left" }}
                />
                {!isSuperAdmin && (
                  <Button
                    tooltip="Admin Atama"
                    tooltipOptions={{ showDelay: 250, position: "left" }}
                    icon="pi pi-shield"
                    className="floating-button"
                    onClick={() => {
                      setSuperAdminModal(true);
                      getSuperAdminTimeline(superAdminPagination.pageNumber = 1, superAdminPagination.pageSize = 10);
                    }}
                  />
                )}
              </>
            )}
            {isHomePage && (
              <>
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
                    getTimeline();
                  }}
                />
              </>
            )}
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
                  <strong>Ad Soyad:</strong> {user.username}
                </p>
                {!isInputDisabled ? (
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
          {timelineData &&
            timelineData.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-word">{item.wordContent}</div>
                {item.rejectionReasons && (
                  <Button
                    icon="pi pi-info"
                    severity="Info"
                    aria-label="Info"
                    className={item.isActive ? "nob-button" : "cool-button"}
                    onClick={() =>
                      handleOpenRejectionDialog(
                        item.rejectionReasons,
                        item.customRejectionReason,
                        item.id,
                        item.isActive,
                        index
                      )
                    }
                  />
                )}
                <div className="timeline-description">
                  {item.descriptionContent}
                </div>
                <div
                  className={`step-parent status-${item.status}`}
                  style={{ marginBottom: 5 }}
                >
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
                      {item.status === 1 ? "✓" : item.status === 3 ? "X" : "?"}
                    </div>
                    <div className="line"></div>
                    <div className="name">
                      {item.status === 1
                        ? "Onaylandı"
                        : item.status === 3
                        ? "Reddedildi"
                        : "Bekliyor"}
                    </div>
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            ))}
        </div>
      </Dialog>
      {/* Süper Admin Modal */}
      <Dialog
        visible={superAdminModal}
        style={{ width: "80%", maxHeight: "80%" }}
        onHide={() => setSuperAdminModal(false)}
        dismissableMask={true}
        closeOnEscape={true}
        blockScroll={true}
        header="Yetki Atama Paneli"
      >
        <DataTable
          value={superAdminData.items}
          paginator
          className="p-datatable-customers"
          rows={superAdminPagination.pageSize}
          totalRecords={superAdminTotalCount.totalCount || 0}
          first={(superAdminPagination.pageNumber - 1) * superAdminPagination.pageSize}
          dataKey="id"
          filterDisplay="row"
          globalFilterFields={["username", "name", "surname", "email"]}
          emptyMessage="Kullanıcı Bulunamadı"
          onPage={onPageChange}
          lazy
        >
          <Column
            header="Kullanıcı Adı"
            filterField="username"
            style={{ minWidth: "20%" }}
            field="username"
            filter
            bodyStyle={{ padding: 40 }}
            filterPlaceholder="Kullanıcı Ara"
          />
          <Column
            header="İsim"
            filterField="name"
            style={{ minWidth: "20%" }}
            field="name"
            filter
            filterPlaceholder="İsim Ara"
          />
          <Column
            header="Soyisim"
            filterField="surname"
            style={{ minWidth: "20%" }}
            field="surname"
            filter
            filterPlaceholder="Soyisim Ara"
          />
          <Column
            header="Email"
            filterField="email"
            style={{ minWidth: "20%" }}
            field="email"
            filter
            filterPlaceholder="Email Ara"
          />
          <Column
            header="Kullanıcı Rolü"
            filter
            filterPlaceholder="Rol Ara"
            style={{ minWidth: "20%" }}
            body={(rowData) => {
              const currentLabel = getRoleLabel(
                rowData.roleId,
                rowData.permissionId
              );

              const roleOptions = [
                { label: "Admin", value: { roleId: 1, permissionId: 1 } },
                { label: "Kullanıcı", value: { roleId: 2, permissionId: 2 } },
                { label: "Süper Admin", value: { roleId: 3, permissionId: 3 } },
              ];

              const currentValue = roleOptions.find(
                (opt) =>
                  opt.value.roleId === rowData.roleId &&
                  opt.value.permissionId === rowData.permissionId
              );

              return (
                <Dropdown
                  options={roleOptions}
                  optionLabel="label"
                  value={currentValue?.value}
                  placeholder={currentLabel}
                  style={{
                    width: "100%",
                    backgroundColor: "#1111",
                    border: "none",
                  }}
                  onChange={(e) => {
                    setPendingRoleChange({
                      userId: rowData.id,
                      roleId: e.value.roleId,
                      permissionId: e.value.permissionId,
                    });
                    setSuperAdminTimesModal(true);
                  }}
                />
              );
            }}
          />
        </DataTable>
      </Dialog>
      {/* Reddedildi Dialog */}
      <Dialog
        visible={showRejectionDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowRejectionDialog(false)}
        dismissableMask={true}
        closeOnEscape={true}
        header="Öneriniz Reddedildi"
      >
        <p>
          Red Sebebi <strong>{selectedRejectionReason}</strong>.
        </p>
      </Dialog>
      {/* Süper Admin Modal Onaylandı */}
      <Dialog
        visible={superAdminTimesModal}
        style={{ width: "25%", maxHeight: "25%" }}
        onHide={() => {
          setSuperAdminTimesModal(false);
          setSuperAdminChecked(false);

          toast.current.show({
            severity: "error",
            summary: "hata",
            detail: "Değişiklik onaylanmadı.",
          });
        }}
        dismissableMask={true}
        closeOnEscape={true}
        closeIcon={true}

        blockScroll={true}
        header="Değişikliği Onaylamak İstediğinize Emin Misiniz?"
      >
        <Button
          label="İptal Et"
          icon="pi pi-times"
          className="p-button-danger"
          onClick={() => {
            setSuperAdminTimesModal(false);
            setSuperAdminChecked(false);
            toast.current.show({
              severity: "error",
              summary: "hata",
              detail: "Değişiklik onaylanmadı.",
            });
          }}
          style={{ marginTop: "1rem", marginRight: "1rem" }}
        />
        <Button
          label="Onayla"
          icon="pi pi-check"
          className="p-button-success"
          onClick={() => {
            setSuperAdminChecked(true);
            setSuperAdminTimesModal(false);
          }}
          style={{ marginTop: "1rem", marginLeft: "1rem"}}
        />
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
