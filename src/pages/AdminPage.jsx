import React, { useState, useEffect, useRef } from "react";
import { TabMenu } from "primereact/tabmenu";

import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { OrderList } from "primereact/orderlist";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ContextMenu } from "primereact/contextmenu";
import { Toast } from "primereact/toast";
import Header from "../companents/Header";
import "../styles/AdminPage.css";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { particlesConfig } from "../assets/particalConfig";

import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";

import { MdOutlineEdit } from "react-icons/md";
import { AiOutlineOrderedList } from "react-icons/ai";
import { GiTeamIdea } from "react-icons/gi";

import { WordsService } from "./WordsService";

import WordOperation from "../companents/WordOperation";
import WordOperationOnly from "../companents/WordOperationOnly";
//import WordOperationMeaning from "../companents/WordOperationMeaning";

import { InputTextarea } from "primereact/inputtextarea";

import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import Searcher from "../companents/Searcher";

import wordApi from "../api/wordApi";
import descriptionApi from "../api/descriptionApi";
import WordTree from "../companents/WordTree";

function AdminPage() {
  const [page, setPage] = useState(0);

  const [hoveredTab, setHoveredTab] = useState(null);

  const [wordsArray, setWordsArray] = useState([]);

  const [editedWordsArray, setEditedWordsArray] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);
  const [openWordModal, setOpenWordModal] = useState(false);

  const [filteredWordArray, setFilteredWordArray] = useState([]);

  const [isWordSearched, setIsWordSearched] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);


  const [visibleDeleteDescription, setVisibleDeleteDescription] =
    useState(false);

  const [visibleDeleteWord, setVisibleDeleteWord] = useState(false);

  const [statuses] = useState(["Onaylı", "Bekliyor", "Reddedildi", "Önerildi"]);

  const [searchedWordforFilter, setSearchedWordforFilter] = useState("");

  const [wordId, setWordId] = useState("");

  const [descriptionId, setDescriptionId] = useState("");

  const [wordAddedSuccessfully, setWordAddedSuccessfully] = useState(false);

  const { isAuthenticated, user } = useAuth();

  const toast = useRef(null);

  const [expandedWordsArray, setExpandedWordsArray] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectionReasonModal, setShowRejectionReasonModal] =
    useState(false);
  const [showCustomReasonModal, setShowCustomReasonModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [nextStatus, setNextStatus] = useState(null);
  const [message, setMessage] = useState(" ");
  const [headerName, setHeaderName] = useState("");
  const [customRejectionReason, setCustomReasonReason] = useState("");
  const [needOrderUpdate, setNeedOrderUpdate] = useState(false);
  const [deletedDescriptionId, setDeletedDescriptionId] = useState("");

  const rejectionReasons = [
    { name: "Uygunsuz", value: 1 },
    { name: "Zaten Mevcut", value: 2 },
    { name: "Eksik Açıklama", value: 3 },
    { name: "Yanlış Tanım", value: 4 },
    { name: "Karmaşık veya Anlaşılmaz İfade", value: 5 },
    { name: "Birden Fazla Anlam", value: 6 },
    { name: "Diğer", value: 7 },
  ];

  const handleRejectionReasonSubmit = async () => {
    if (rejectionReason) {
      if (rejectionReason === 7) {
        setShowCustomReasonModal(true);
        return;
      }

      const response = await descriptionApi.UpdateStatus(
        descriptionId,
        3,
        rejectionReason
      );

      if (response.isSuccess) {
        toastForNotification.current.show({
          severity: "success",
          summary: "Başarılı",
          detail: response.message,
        });

        fetchData();

        setShowConfirm(false);
        setShowRejectionReasonModal(false);
        setRejectionReason("");
      }
    } else {
      toastForNotification.current.show({
        severity: "warn",
        summary: "Uyarı",
        detail: "Lütfen bir ret sebebi seçiniz",
      });
    }
  };

  const handleCustomReasonSubmit = async () => {
    if (!customRejectionReason.trim()) {
      toastForNotification.current.show({
        severity: "warn",
        summary: "Uyarı",
        detail: "Lütfen ret sebebini yazınız",
      });
      return;
    }

    const response = await descriptionApi.UpdateStatus(
      descriptionId,
      3,
      rejectionReason,
      customRejectionReason
    );

    if (response.isSuccess) {
      toastForNotification.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
      });

      fetchData();

      setShowConfirm(false);
      setShowRejectionReasonModal(false);
      setShowCustomReasonModal(false);
      setCustomReasonReason("");
      setRejectionReason("");
    }
  };

  const getSeverity = (status) => {
    switch (status) {
      case "Reddedildi":
        return "danger";

      case "Onaylı":
        return "success";

      case "Bekliyor":
        return "info";

      case "Önerildi":
        return "info";
    }
  };

  const toastForNotification = useRef(null);

  const cm = useRef(null); // context menu için
  const cm2 = useRef(null); // context menu2 için

  const closingModalF = () => {
    setOpenModal(false);
  };

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const statusFilter = (status) => {
    const statusMap = {
      1: "Onaylı",
      2: "Bekliyor",
      3: "Reddedildi",
      4: "Önerildi",
    };

    return statusMap[status];
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descriptionContent: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    wordContent: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lastEditedDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
    recommender: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "previousDescription.descriptionContent": {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const handleMouseEnter = (index) => {
    // hover işlemleri
    setHoveredTab(index);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const acceptDeleteDescription = async () => {
    var response = await descriptionApi.DeleteDescription(deletedDescriptionId);
    if (response.isSuccess) {
      toast.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
        life: 3000,
      });

      setNeedOrderUpdate(true);//flag
      fetchData();
    }
  };

  const onGlobalFilterChange = (e) => {
    // datatable filtreleme işlemleri
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const fetchData = async () => {
    const response = await wordApi.GetAllWords();
    if (response.isSuccess) {
      toastForNotification.current.show({
        life: 750,
        severity: "info",
        summary: "Info",
        detail: response.message,
      });
      const { body } = response;
      setWordsArray(body);
      const pendingCount = body.filter((item) => item.status === 2).length;
      setPendingCount(pendingCount);
    }
  };

  const WordAddedHandle = (status) => {
    setWordAddedSuccessfully(status);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end" style={{ display: "flex" }}>
        <IconField iconPosition="left">
          <InputIcon
            className="pi pi-search"
            style={{ marginLeft: 10, marginTop: -10 }}
          />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Tümünde ara"
          />
        </IconField>
        <Button
          tooltip="Yeni Kelime Ekle"
          tooltipOptions={{ showDelay: 250, mouseTrack: true }}
          label="Yeni Kelime Ekle"
          icon="pi pi-plus"
          className="custom-button"
          onClick={() => {
            setOpenWordModal(true);
          }}
          style={{ marginLeft: "2rem" }}
        />
      </div>
    );
  };

  const header = renderHeader();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Anlam sıralarını değiştir ve önerileri değerlendir sayfaları için
    const flatArray = wordsArray.flatMap((item) =>
      item.descriptions.map((desc, index) => ({
        index: index,
        wordId: item.id,
        descriptionId: desc.id,
        wordContent: item.wordContent,
        descriptionContent: desc.descriptionContent,
        recommender:
          desc.recommender !== null ? desc.recommender.fullName : "Boş",
        lastEditedDate: desc.lastEditedDate,
        order: desc.order,
        status: statusFilter(desc.status),
        previousDescription:
          desc.previousDescription !== null ? desc.previousDescription : "Boş",
      }))
    );

    const sortedArray = flatArray.sort((a, b) => {
      let dateA =
        a.lastEditedDate !== "Boş" ? new Date(a.lastEditedDate) : new Date(0);
      let dateB =
        b.lastEditedDate !== "Boş" ? new Date(b.lastEditedDate) : new Date(0);
      return dateB - dateA; // Descending order
    });

    setEditedWordsArray(sortedArray);

    // Yeni kelime ekle ve düzenle sayfası için
    const grouped = wordsArray.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          wordId: item.id,
          wordContent: item.wordContent,
          descriptions: [],
        };
      }
      item.descriptions.forEach((desc, index) => {
        acc[item.id].descriptions.push({
          index: index,
          descriptionId: desc.id,
          descriptionContent: desc.descriptionContent,
          recommender:
            desc.recommender !== null ? desc.recommender.fullName : "Boş",
          lastEditedDate:
            item.lastEditedDate !== null
              ? item.lastEditedDate.split("T")[0]
              : "Boş",
          order: desc.order,
          status: statusFilter(desc.status),
        });
      });
      return acc;
    }, {});
    setExpandedWordsArray(Object.values(grouped));
  }, [wordsArray]);

  const itemTemplate = (item) => {
    return (
      <div className="flex align-items-center gap-2">
        <span style={{ fontWeight: "bold", marginRight: "1rem" }}>
          {item.index + 1}-
        </span>
        <span>{item.descriptionContent}</span>
      </div>
    );
  };
  const onRowEditComplete = async (e) => {
    try {
      let _wordsArray = [...editedWordsArray];
      let { newData, index } = e;
      let targetDescription = {};

      _wordsArray[index] = newData;

      _wordsArray.forEach((p) => {
        if (p.descriptionId == index.key) {
          targetDescription = p;
        }
      });

      const response = await wordApi.UpdateWord(
        targetDescription.wordId,
        targetDescription.descriptionId,
        newData.wordContent,
        newData.descriptionContent
      );

      if (response.isSuccess) {
        toastForNotification.current.show({
          severity: "success",
          summary: "Başarılı",
          detail: response.message,
        });
        setEditedWordsArray(_wordsArray);
        return Promise.resolve(); // Başarılı güncelleme
      } else {
        return Promise.reject(new Error("Update failed")); // Başarısız güncelleme
      }
    } catch (error) {
      console.error("Update failed:", error);
      return Promise.reject(error); // Hata durumu
    }
  };

  const handleWordEdit = async (wordId, wordContent) => {
    try {
      const response = await wordApi.UpdateWordById(wordId, wordContent);
      if (response.isSuccess) {
        toastForNotification.current.show({
          severity: "success",
          summary: "Başarılı",
          detail: response.message,
        });
        setWordsArray(prevWords => 
          prevWords.map(word => {
            if (word.wordId === wordId) {
              return { ...word, wordContent: wordContent };
            }
            return word;
          })
        );
        return true;
        
      }
      return false;
    } catch (error) {
      return false;
    }
  };


  const updateDescriptionStatusHandler = async (status) => {
    try {
      let reasonToSend = status === 3 ? rejectionReason : 0;

      const response = await descriptionApi.UpdateStatus(
        descriptionId,
        status,
        reasonToSend
      );

      if (response.isSuccess) {
        toastForNotification.current.show({
          severity: "success",
          summary: "Başarılı",
          detail: response.message,
        });

        await fetchData();

        setShowRejectionReasonModal(false);
        setRejectionReason("");
        setShowConfirm(false);
      } else {
        toastForNotification.current.show({
          severity: "error",
          summary: "Hata",
          detail: "Status güncellenirken bir hata oluştu",
        });
      }
    } catch (error) {
      console.error("Status update error:", error);
      toastForNotification.current.show({
        severity: "error",
        summary: "Hata",
        detail: "Status güncellenirken bir hata oluştu",
      });
    }
  };

  const acceptDeleteWord = async () => {
    const response = await wordApi.DeleteWord(wordId);

    if (response.isSuccess) {
      toastForNotification.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
      });

      fetchData();
    }
  };

  const acceptAddWord = async () => {
    setOpenWordModal(true);
  };

  const searchedWordF = (word) => {
    setSearchedWordforFilter(word);
  };

  const isSearched = () => {
    setIsWordSearched(true);
  };

  const statusRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterApplyCallback(e.value)}
        itemTemplate={statusItemTemplate}
        placeholder="Duruma göre ara"
        className="p-column-filter"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );
  };
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.status}
        style={{ cursor: "pointer" }}
        severity={getSeverity(rowData.status)}
        onClick={(e) => {
          setDescriptionId(rowData.descriptionId);
          cm.current.show(e);
        }}
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getSeverity(option)} />;
  };

  const changeOrder = async (e) => {
    const values = e.value;
    let isSucceded = true;
    let message = "";
    for (let i = 0; i < values.length; i++) {
      var response = await descriptionApi.UpdateOrder(
        values[i].descriptionId,
        i
      );
      if (!response.isSuccess) {
        isSucceded = false;
        break;
      }
      message = response.message;
    }
    if (isSucceded) {
      toast.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: message,
        life: 3000,
      });

      setFilteredWordArray(values);

      fetchData();
    }
  };

  const items = [
    {
      label: "Onaylı",
      icon: "pi pi-check",
      className: `p-success-${getSeverity("Onaylı")}`,
      command: () => {
        //   updateDescriptionStatusHandler(1);
        setShowConfirm(true);
        setNextStatus(1);
        setMessage("Bu öneriyi onaylamak istediğinize emin misiniz?");
        setHeaderName("Onayla");
      },
    },
    {
      label: "Bekliyor",
      icon: "pi pi-spin pi-spinner",
      className: `p-info-${getSeverity("Bekliyor")}`,
      command: () => {
        //updateDescriptionStatusHandler(2);
        setShowConfirm(true);
        setNextStatus(2);
        setMessage("Bu öneriyi bekletmek istediğinize emin misiniz?");
        setHeaderName("Beklet");
      },
    },
    {
      label: "Reddedildi",
      icon: "pi pi-times",
      className: `p-error-${getSeverity("Reddedildi")}`,
      command: () => {
        //   updateDescriptionStatusHandler(3);
        setShowConfirm(true);
        setNextStatus(3);
        setMessage("Bu öneriyi reddetmek istediğinize emin misiniz?");
        setHeaderName("Reddet");
      },
    },
  ];

  const deleteWordHandler = () => {
    setVisibleDeleteWord(true);
  };

  const items2 = [
    {
      label: "Kelimeyi Sil",
      icon: "pi pi-times",
      className: `p-error-deleteWord`,
      command: () => {
        deleteWordHandler();
      },
    },
  ];
  useEffect(() => {
    setFilteredWordArray(
      editedWordsArray.filter(
        (item) => item.wordContent == searchedWordforFilter
      )
    );
  }, [searchedWordforFilter]);

  useEffect(() => {
    if (wordAddedSuccessfully) {
      fetchData();
      setWordAddedSuccessfully(false);
    }
  }, [wordAddedSuccessfully]);

  const menuItems = [
    {
      label: "Yeni Kelime Ekle ve Düzenle",
      icon: "pi pi-fw pi-pencil",
      command: () => setPage(0),
    },
    {
      label: "Önerileri Değerlendir",
      icon: "pi pi-fw pi-check-square",
      command: () => setPage(1),
      template: (item, options) => {
        return (
          <a
            className={options.className}
            target={item.target}
            onClick={options.onClick}
          >
            <span className={`${item.icon} ${options.iconClassName}`}></span>
            <span className={options.labelClassName}>{item.label} </span>
            <span className="notification-badge">{pendingCount}</span>
          </a>
        );
      },
    },
  ];

  return (
    <>
      {isAuthenticated && user.role === "2" ? (
        <>
          <Toast ref={toastForNotification} />
          <Toast ref={toast} />
          <ConfirmDialog
            visible={showConfirm}
            onHide={() => setShowConfirm(false)}
            message={message}
            header={headerName}
            icon="pi pi-check-square"
            acceptClassName="p-button-accept"
            acceptLabel="Evet"
            rejectLabel="Hayır"
            accept={() => {
              if (nextStatus === 3) {
                setShowConfirm(false);
                setShowRejectionReasonModal(true);
              } else {
                updateDescriptionStatusHandler(nextStatus);
                //setShowConfirm(false);
              }
            }}
            reject={() => setShowConfirm(false)}
          />
          <Dialog
            header="Reddetme Sebebini Seçin"
            visible={showRejectionReasonModal}
            style={{ width: "350px" }}
            modal
            onHide={() => setShowRejectionReasonModal(false)}
            footer={
              <div>
                <Button
                  label="İptal"
                  icon="pi pi-times"
                  onClick={() => setShowRejectionReasonModal(false)}
                  className="p-button-text"
                />
                <Button
                  label="Gönder"
                  icon="pi pi-check"
                  onClick={handleRejectionReasonSubmit}
                  autoFocus
                />
              </div>
            }
          >
            <Dialog
              header="Diğer Reddetme Sebebi"
              visible={showCustomReasonModal}
              style={{ width: "400px" }}
              modal
              onHide={() => {
                setShowCustomReasonModal(false);
                setCustomReasonReason("");
              }}
              footer={
                <div>
                  <Button
                    label="İptal"
                    icon="pi pi-times"
                    onClick={() => {
                      setShowCustomReasonModal(false);
                      setCustomReasonReason("");
                    }}
                    className="p-button-text"
                  />
                  <Button
                    label="Gönder"
                    icon="pi pi-check"
                    onClick={handleCustomReasonSubmit}
                    autoFocus
                  />
                </div>
              }
            >
              <div className="flex flex-column gap-3">
                <InputTextarea
                  value={customRejectionReason}
                  onChange={(e) => setCustomReasonReason(e.target.value)}
                  rows={5}
                  cols={30}
                  autoResize
                  placeholder="Diğer reddetme sebebini yazınız."
                  className="w-full"
                />
              </div>
            </Dialog>

            <div className="flex flex-column gap-3">
              {rejectionReasons.map((reason) => (
                <div key={reason.value} className="flex align-items-center">
                  <RadioButton
                    inputId={`reason-${reason.value}`}
                    name="rejectionReason"
                    value={reason.value}
                    onChange={(e) => setRejectionReason(e.value)}
                    checked={rejectionReason === reason.value}
                  />
                  <label htmlFor={`reason-${reason.value}`} className="ml-2">
                    {reason.name}
                  </label>
                </div>
              ))}
            </div>
          </Dialog>

          <ConfirmDialog
            group="declarative"
            visible={visibleDeleteDescription}
            onHide={() => setVisibleDeleteDescription(false)}
            message="Bu kelimeye bağlı anlamı silmek istediğinize emin misiniz?"
            header="Silmeyi Onayla"
            acceptClassName="p-button-accept"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Evet"
            rejectLabel="Hayır"
            accept={acceptDeleteDescription}
          />
          <ConfirmDialog
            group="declarative"
            visible={visibleDeleteWord}
            onHide={() => setVisibleDeleteWord(false)}
            message="Bu kelimeyi tamamıyla silmek istediğinize emin misiniz?"
            header="Silmeyi Onayla"
            acceptClassName="p-button-accept"
            acceptLabel="Evet"
            rejectLabel="Hayır"
            icon="pi pi-exclamation-triangle"
            accept={acceptDeleteWord}
          />
          <Header />
          <ContextMenu model={items2} ref={cm2} breakpoint="767px" />
          <ContextMenu model={items} ref={cm} breakpoint="767px" />
          <WordOperationOnly
            visible={openWordModal}
            closingModal={() => setOpenWordModal(false)}
            word=""
            isSuccessfull={WordAddedHandle}
          />
          <WordOperation
            visible={openDescriptionModal}
            closingModal={() => setOpenDescriptionModal(false)}
            word=""
            isAdd={true}
            isSuccessfull={WordAddedHandle}
          />

          <Particles
            id="tsparticles"
            options={particlesConfig}
            className="particles-background"
          />
          <div className="admin-page-container">
            <div className="admin-menu">
              <TabMenu
                model={menuItems}
                activeIndex={page}
                onTabChange={(e) => setPage(e.index)}
              />
            </div>
            <div className="admin-content">
              <TabView activeIndex={page} onTabChange={(e) => setPage(e.index)}>
                <TabPanel>
                  <div className="datatable-for-edit">
                    <WordTree
                      wordsArray={expandedWordsArray}
                      onWordEditComplete={handleWordEdit}
                      onRowEditComplete={onRowEditComplete}
                      filters={filters}
                      header={header}
                      textEditor={textEditor}
                      setOpenModal={setOpenModal}
                      setOpenWordModal={setOpenWordModal}
                      setOpenDescriptionModal={setOpenDescriptionModal}
                      setVisibleDeleteDescription={setVisibleDeleteDescription}
                      deletedDescriptionId={deletedDescriptionId}                  
                      setDeletedDescriptionId={setDeletedDescriptionId}
                      needOrderUpdate={needOrderUpdate}
                      setNeedOrderUpdate={setNeedOrderUpdate}
                      setVisibleDeleteWord={setVisibleDeleteWord}
                      deleteWordHandler={deleteWordHandler}
                      setWordId={setWordId}
                      cm2={cm2}
                      globalFilterFields={[
                        "wordContent",
                        "descriptionContent",
                        "lastEditedDate",
                        "recommender",
                      ]}
                      statusBodyTemplate={statusBodyTemplate}
                      statusRowFilterTemplate={statusRowFilterTemplate}
                    >
                      {/* ... Columnlar WordTree.jsx in içinde */}
                    </WordTree>
                  </div>
                </TabPanel>

                <TabPanel>
                  <p className="m-0">
                    <DataTable
                      value={editedWordsArray}
                      paginator
                      rows={10}
                      dataKey="descriptionId"
                      filters={filters}
                      filterDisplay="row"
                      globalFilterFields={[
                        "wordContent",
                        "descriptionContent",
                        "status",
                        "previousDescription.descriptionContent",
                        "recommender",
                      ]}
                      emptyMessage="Kelime bulunamadı."
                    >
                      <Column
                        field="wordContent"
                        header="Kelimeler"
                        filter
                        editor={(options) => textEditor(options)}
                        filterPlaceholder="Kelimeye göre ara"
                        style={{ minWidth: "18rem", borderTopLeftRadius: 15 }}
                        bodyStyle={{ padding: 25 }}
                      />
                      <Column
                        header="Anlam"
                        field="descriptionContent"
                        filterField="descriptionContent"
                        style={{ maxWidth: "40rem" }}
                        editor={(options) => textEditor(options)}
                        filter
                        filterPlaceholder="Anlama göre ara"
                      />
                      <Column
                        header="Önceki Anlam"
                        field="previousDescription.descriptionContent"
                        filterField="previousDescription.descriptionContent"
                        body={(rowData) =>
                          rowData.previousDescription.descriptionContent
                            ? rowData.previousDescription.descriptionContent
                            : " "
                        }
                        style={{ minWidth: "12rem" }}
                        editor={(options) => textEditor(options)}
                        filter
                        filterPlaceholder="Önceki anlama göre ara"
                      />
                      <Column
                        header="Öneren"
                        field="recommender"
                        filterField="recommender"
                        style={{ minWidth: "12rem" }}
                        editor={(options) => textEditor(options)}
                        filter
                        filterPlaceholder="Önerene göre ara"
                      />
                      <Column
                        header="Durum"
                        field="status"
                        filterField="status"
                        style={{ minWidth: "12rem" }}
                        body={statusBodyTemplate}
                        showFilterMenu={false}
                        filterMenuStyle={{ width: "14rem" }}
                        filter
                        filterElement={statusRowFilterTemplate}
                      />
                    </DataTable>
                  </p>
                </TabPanel>
              </TabView>
            </div>
          </div>
        </>
      ) : (
        <Navigate to="/SignIn" />
      )}
    </>
  );
}

export default AdminPage;
