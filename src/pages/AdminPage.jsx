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

  const [visible, setVisible] = useState(false);

  const [descriptionId, setDescriptionId] = useState("");

  const [statuses] = useState(["approved", "pending", "rejected"]);

  const [searchedWordforFilter, setSearchedWordforFilter] = useState("");

  const [wordId, setTheWordId] = useState("");

  const { isAuthenticated, user } = useAuth();

  const toast = useRef(null);

  const getSeverity = (status) => {
    switch (status) {
      case "rejected":
        return "danger";

      case "approved":
        return "success";

      case "pending":
        return "info";
    }
  };

  const toastForNotification = useRef(null);

  const cm = useRef(null); // context menu için

  const closingModalF = () => {
    setOpenModal(false);
  };

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descriptionContent: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    wordContent: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lastEditedDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
    recommender: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handleMouseEnter = (index) => {
    // hover işlemleri
    setHoveredTab(index);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const wordIdSetter = (id) => {
    setTheWordId(id);
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

  const accept = async () => {
    var response = await descriptionApi.DeleteDescription(deletedDescriptionId);
    if (response.isSuccess) {
      toast.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
        life: 3000,
      });
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
        severity: "info",
        summary: "Info",
        detail: response.message,
      });
      const { body } = response;
      setWordsArray(body);
    }
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
      item.descriptions.map((desc) => ({
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
      }))
    );
    setEditedWordsArray(x);
  }, [wordsArray]);

  const itemTemplate = (item) => {
    debugger;
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-tag text-sm"></i>
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

  const dragDropHandler = (e) => {
    //debugger;
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
        placeholder="Select One"
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
          cm.current.show(e);
        }}
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getSeverity(option)} />;
  };

  const items = [
    {
      label: "Rejected",
      icon: "pi pi-times",
      className: `p-error-${getSeverity("rejected")}`,
    },
    {
      label: "Approved",
      icon: "pi pi-check",
      className: `p-success-${getSeverity("approved")}`,
    },
    {
      label: "Pending",
      icon: "pi pi-spin pi-spinner",
      className: `p-info-${getSeverity("pending")}`,
    },
  ];

  useEffect(() => {
    debugger;
    setFilteredWordArray(
      editedWordsArray.filter(
        (item) => item.wordContent == searchedWordforFilter
      )
    );
  }, [searchedWordforFilter]);
  return (
    <>
      {isAuthenticated && user.role === "2" ? (
        <>
          <Toast ref={toastForNotification} />
          <Toast ref={toast} />
          <ConfirmDialog
            group="declarative"
            visible={visible}
            onHide={() => setVisible(false)}
            message="Bu kelimeye bağlı açıklamayı silmek istediğinize emin misiniz?"
            header="Silmeyi Onayla"
            acceptClassName="p-button-danger"
            icon="pi pi-exclamation-triangle"
            accept={accept}
          />
          <Header />
          <ContextMenu model={items} ref={cm} breakpoint="767px" />
          <WordOperation
            visible={openModal}
            closingModal={closingModalF}
            isAdd={true}
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
                  <h2>Kelime Ekle Veya Düzenle</h2>
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
                            setVisible(true);
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
                        setFilteredWordArray(e.value);
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
                    //value={transformedData}
                    paginator
                    rows={10}
                    dataKey="id"
                    editMode="row"
                    //onRowEditComplete={onRowEditComplete}
                    filters={filters}
                    filterDisplay="row"
                    loading={loading}
                    globalFilterFields={["word", "description", "status"]}
                    emptyMessage="Kelime bulunamadı."
                  >
                    <Column
                      field="word"
                      header="Kelimeler"
                      filter
                      editor={(options) => textEditor(options)}
                      filterPlaceholder="Kelimeye göre ara"
                      style={{ minWidth: "12rem", borderTopLeftRadius: 15 }}
                      bodyStyle={{ padding: 25 }}
                    />
                    <Column
                      header="Açıklama"
                      field="description"
                      filterField="description"
                      style={{ minWidth: "12rem" }}
                      editor={(options) => textEditor(options)}
                      filter
                      filterPlaceholder="Açıklamaya göre ara"
                    />
                    <Column
                      header="Durum"
                      field="status"
                      filterField="status"
                      style={{ minWidth: "12rem" }}
                      editor={(options) => textEditor(options)}
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
        <>
          {!isAuthenticated && user.role !== "2" && <Navigate to="/SignIn" />}
        </>
      )}
    </>
  );
}

export default AdminPage;
