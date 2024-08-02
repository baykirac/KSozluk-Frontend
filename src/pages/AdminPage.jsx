import React, { useState, useEffect, useRef } from "react";

import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
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

import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import Searcher from "../companents/Searcher";

import wordApi from "../api/wordApi";
import descriptionApi from "../api/descriptionApi";

function AdminPage() {
  const [page, setPage] = useState(0);

  const [hoveredTab, setHoveredTab] = useState(null);

  const [wordsArray, setWordsArray] = useState([]);

  const [editedWordsArray, setEditedWordsArray] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [filteredWordArray, setFilteredWordArray] = useState([]);

  const [isWordSearched, setIsWordSearched] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);

  const [deletedDescriptionId, setDeletedDescriptionId] = useState("");

  const [visibleDeleteDescription, setVisibleDeleteDescription] =
    useState(false);

  const [visibleDeleteWord, setVisibleDeleteWord] = useState(false);

  const [statuses] = useState(["Onaylı", "Bekliyor", "Reddedildi"]);

  const [searchedWordforFilter, setSearchedWordforFilter] = useState("");

  const [wordId, setWordId] = useState("");

  const [descriptionId, setDescriptionId] = useState("");

  const [wordAddedSuccessfully, setWordAddedSuccessfully] = useState(false);

  const { isAuthenticated, user } = useAuth();

  const toast = useRef(null);

  const getSeverity = (status) => {
    switch (status) {
      case "Reddedildi":
        return "danger";

      case "Onaylı":
        return "success";

      case "Bekliyor":
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
        life:750,
        severity: "info",
        summary: "Info",
        detail: response.message,
      });
      const { body } = response;
      setWordsArray(body);
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
            setOpenModal(true);
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
    const x = wordsArray.flatMap((item) =>
      item.descriptions.map((desc, index) => ({
        index: index,
        wordId: item.id,
        descriptionId: desc.id,
        wordContent: item.wordContent,
        descriptionContent: desc.descriptionContent,
        recommender:
          desc.recommender !== null ? desc.recommender.fullName : "Boş",
        lastEditedDate:
          item.lastEditedDate !== null
            ? item.lastEditedDate.split("T")[0]
            : "Boş",
        order: desc.order,
        status: statusFilter(desc.status),
      }))
    );
    setEditedWordsArray(x);
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
    let _wordsArray = [...editedWordsArray];
    let { newData, index } = e;

    _wordsArray[index] = newData;

    const response = await wordApi.UpdateWord(
      newData.wordId,
      newData.descriptionId,
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
    }
  };

  const deleteWordHandler = () => {
    setVisibleDeleteWord(true);
  };

  const updateDescriptionStatusHandler = async (status) => {
    const response = await descriptionApi.UpdateStatus(descriptionId, status);

    if (response.isSuccess) {
      toastForNotification.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
      });

      fetchData();
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
    debugger;
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
        updateDescriptionStatusHandler(1);
      },
    },
    {
      label: "Bekliyor",
      icon: "pi pi-spin pi-spinner",
      className: `p-info-${getSeverity("Bekliyor")}`,
      command: () => {
        updateDescriptionStatusHandler(2);
      },
    },
    {
      label: "Reddedildi",
      icon: "pi pi-times",
      className: `p-error-${getSeverity("Reddedildi")}`,
      command: () => {
        updateDescriptionStatusHandler(3);
      },
    },
  ];

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
  return (
    <>
      {isAuthenticated && user.role === "2" ? (
        <>
          <Toast ref={toastForNotification} />
          <Toast ref={toast} />
          <ConfirmDialog
            group="declarative"
            visible={visibleDeleteDescription}
            onHide={() => setVisibleDeleteDescription(false)}
            message="Bu kelimeye bağlı açıklamayı silmek istediğinize emin misiniz?"
            header="Silmeyi Onayla"
            acceptClassName="p-button-danger"
            icon="pi pi-exclamation-triangle"
            accept={acceptDeleteDescription}
          />
          <ConfirmDialog
            group="declarative"
            visible={visibleDeleteWord}
            onHide={() => setVisibleDeleteWord(false)}
            message="Bu kelimeyi tamamıyla silmek istediğinize emin misiniz?"
            header="Silmeyi Onayla"
            acceptClassName="p-button-danger"
            icon="pi pi-exclamation-triangle"
            accept={acceptDeleteWord}
          />
          <Header />
          <ContextMenu model={items2} ref={cm2} breakpoint="767px" />
          <ContextMenu model={items} ref={cm} breakpoint="767px" />
          <WordOperation
            visible={openModal}
            closingModal={closingModalF}
            isAdd={true}
            isSuccessfull={WordAddedHandle}
          />
          <Particles
            id="tsparticles"
            options={particlesConfig}
            className="particles-background"
          />
          <div className="sidebar">
            <Sidebar defaultValue={false}>
              <Menu>
                <MenuItem
                  onClick={() => setPage(0)}
                  icon={<MdOutlineEdit size={36} style={{ paddingRight: 5 }} />}
                  className={`sidebar-menu-item ${
                    hoveredTab === 0 ? "hovered" : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter(0)}
                  onMouseLeave={handleMouseLeave}
                >
                  Yeni Kelime Ekle ve Düzenle
                </MenuItem>
                <MenuItem
                  onClick={() => setPage(1)}
                  icon={
                    <AiOutlineOrderedList
                      size={36}
                      style={{ paddingRight: 5 }}
                    />
                  }
                  className={`sidebar-menu-item ${
                    hoveredTab === 1 ? "hovered" : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter(1)}
                  onMouseLeave={handleMouseLeave}
                >
                  Anlam Sıralarını Değiştir
                </MenuItem>
                <MenuItem
                  onClick={() => setPage(2)}
                  icon={<GiTeamIdea size={36} style={{ paddingRight: 5 }} />}
                  className={`sidebar-menu-item notification ${
                    hoveredTab === 2 ? "hovered" : ""
                  }`}
                  onMouseEnter={() => handleMouseEnter(2)}
                  onMouseLeave={handleMouseLeave}
                >
                  Önerileri Değerlendir
                  <span className="notification-badge">{pendingCount}</span>
                </MenuItem>
              </Menu>
            </Sidebar>
          </div>
          <div className="tabs">
            <TabView activeIndex={page} onTabChange={(e) => setPage(e.index)}>
              <TabPanel>
                <div className="datatable-for-edit">
                  <h2>Kelime Ekle veya Düzenle</h2>
                  <DataTable
                    value={editedWordsArray}
                    paginator
                    rows={10}
                    dataKey="descriptionId"
                    editMode="row"
                    onRowEditComplete={onRowEditComplete}
                    filters={filters}
                    filterDisplay="row"
                    //loading={loading}
                    globalFilterFields={[
                      "wordContent",
                      "descriptionContent",
                      "lastEditedDate",
                      "recommender",
                    ]}
                    header={header}
                    emptyMessage="Kelime bulunamadı."
                  >
                    <Column
                      field="wordContent"
                      header="Kelimeler"
                      body={(rowData) => (
                        <div
                          onContextMenu={(e) => {
                            setWordId(rowData.wordId);
                            cm2.current.show(e);
                          }}
                        >
                          {rowData.wordContent}
                        </div>
                      )}
                      filter
                      editor={(options) => textEditor(options)}
                      filterPlaceholder="Kelimeye göre ara"
                      style={{ minWidth: "12rem", borderTopLeftRadius: 15 }}
                      bodyStyle={{ padding: 25 }}
                    />
                    <Column
                      header="Açıklama"
                      field="descriptionContent"
                      filterField="descriptionContent"
                      style={{ minWidth: "12rem" }}
                      editor={(options) => textEditor(options)}
                      filter
                      filterPlaceholder="Açıklamaya göre ara"
                    />
                    <Column
                      header="Son Düzenleme Tarihi"
                      field="lastEditedDate"
                      filterField="lastEditedDate"
                      style={{ minWidth: "12rem" }}
                      filter
                      filterPlaceholder="Son düzenlenme tarihine göre ara"
                    />
                    <Column
                      header="Anlamı Öneren"
                      field="recommender"
                      filterField="recommender"
                      style={{ minWidth: "12rem" }}
                      filter
                      filterPlaceholder="Önerene göre ara"
                    />
                    <Column
                      rowEditor={true}
                      headerStyle={{ width: "10%", minWidth: "8rem" }}
                      bodyStyle={{ textAlign: "center" }}
                      style={{ borderTopRightRadius: 15 }}
                    ></Column>

                    <Column
                      body={(rowData) => (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger"
                          onClick={(e) => {
                            setVisibleDeleteDescription(true);
                            setDeletedDescriptionId(rowData.descriptionId);
                          }}
                        />
                      )}
                      headerStyle={{ width: "10%", minWidth: "8rem" }}
                      bodyStyle={{ textAlign: "center" }}
                    ></Column>
                  </DataTable>
                </div>
              </TabPanel>
              <TabPanel>
                <p className="m-0">
                  <h2>Anlam Sıralarını Değiştir</h2>
                  <div className="card xl:flex xl:justify-content-center">
                    <OrderList
                      dataKey="descriptionId"
                      value={filteredWordArray}
                      onChange={(e) => {
                        changeOrder(e);
                      }}
                      itemTemplate={itemTemplate}
                      header={
                        <Searcher
                          forModal={true}
                          forAdmin={true}
                          searchedWordF={searchedWordF}
                          isSearched={isSearched}
                          setTheWordF={searchedWordF}
                        />
                      }
                      dragdrop
                    ></OrderList>
                  </div>
                </p>
              </TabPanel>
              <TabPanel>
                <p className="m-0">
                  <h2>Önerileri Değerlendir</h2>
                  <DataTable
                    value={editedWordsArray}
                    paginator
                    rows={10}
                    dataKey="descriptionId"
                    filters={filters}
                    filterDisplay="row"
                    //loading={loading}
                    globalFilterFields={[
                      "wordContent",
                      "descriptionContent",
                      "status",
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
                      style={{ minWidth: "12rem", borderTopLeftRadius: 15 }}
                      bodyStyle={{ padding: 25 }}
                    />
                    <Column
                      header="Açıklama"
                      field="descriptionContent"
                      filterField="descriptionContent"
                      style={{ minWidth: "12rem" }}
                      editor={(options) => textEditor(options)}
                      filter
                      filterPlaceholder="Açıklamaya göre ara"
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
        </>
      ) : (
        <>{<Navigate to="/SignIn" />}</>
      )}
    </>
  );
}

export default AdminPage;
