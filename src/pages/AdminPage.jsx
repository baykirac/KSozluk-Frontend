import React, { useState, useEffect, useRef } from "react";

import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
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

import Header from "../companents/Header";
import "../styles/AdminPage.css";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { particlesConfig } from "../assets/particalConfig";

import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";

import { MdOutlineEdit } from "react-icons/md";
import { AiOutlineOrderedList } from "react-icons/ai";
import { GiTeamIdea } from "react-icons/gi";
import { FaPencilAlt } from "react-icons/fa";

import { WordsService } from "./WordsService";
import { TbABOff } from "react-icons/tb";

import WordOperation from "../companents/WordOperation";

import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import Searcher from "../companents/Searcher";

function AdminPage() {
  const [page, setPage] = useState(0);

  const [hoveredTab, setHoveredTab] = useState(null);

  const [wordsArray, setWordsArray] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [filteredWordArray, setFilteredWordArray] = useState([]);

  const [searchedWordforFilter, setSearchedWordforFilter] = useState("");

  const [isWordSearched, setIsWordSearched] = useState(false);

  const [transformedData, setTransformedData] = useState([]);

  const [statusApprovedWords, setStatusApprovedWords] = useState([]);

  const [pendingCount, setPendingCount] = useState(0);

  const [statuses] = useState(["approved", "pending", "rejected"]);

  const { isAuthenticated, user } = useAuth();

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

  const toast = useRef(null);

  const cm = useRef(null); // context menu için

  const closingModalF = () => {
    setOpenModal(false);
  };

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: {
      value: null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    word: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const handleMouseEnter = (index) => {
    // hover işlemleri
    setHoveredTab(index);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const onRowEditComplete = (e) => {
    // row edit işlemleri
    let _wordsArray = [...transformedData];
    let { newData, index } = e;

    _wordsArray[index] = newData;

    setTransformedData(_wordsArray);
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

  const onGlobalFilterChange = (e) => {
    // datatable filtreleme işlemleri
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
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
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {});

    WordsService.getWordsMedium().then((data) => {
      setWordsArray(data);
      setLoading(false);
    });

    //console.log(user);
  }, []);

  useEffect(() => {
    if (isWordSearched) {
      filterArray(transformedData, searchedWordforFilter);
    }
  }, [isWordSearched, searchedWordforFilter]);

  useEffect(() => {
    const newTransferedData = wordsArray.flatMap((item) =>
      item.descriptions.map((description) => ({
        wordId: item.id,
        word: item.word,
        descriptionId: description.id,
        description: description.text,
        status: description.status,
      }))
    );

    const activeWordsData = newTransferedData.filter(
      (description) => description.status === "approved"
    );

    const pendingC = newTransferedData.filter(
      (item) => item.status === "pending"
    ).length;

    setPendingCount(pendingC);
    setStatusApprovedWords(activeWordsData);
    setTransformedData(newTransferedData);
  }, [wordsArray]);

  const itemTemplate = (item) => {
    return (
      <div className="p-clearfix">
        <div style={{ fontSize: "1.2em" }}>{item.description}</div>
      </div>
    );
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

  const filterArray = (array, searchString) => {
    setFilteredWordArray(
      array.filter((item) =>
        item.word.toLowerCase().includes(searchString.toLowerCase())
      )
    );
  };

  const accept = () => {
    toast.current.show({
      severity: "info",
      summary: "Confirmed",
      detail: "You have accepted",
      life: 3000,
    });
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejected",
      detail: "You have rejected",
      life: 3000,
    });
  };

  const confirm2 = () => {
    confirmDialog({
      message: "Bu satırı silmek istediğinize emin misiniz?",
      header: "Silmeyi Onayla",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept,
      reject,
    });
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

  return (
    <>
      {isAuthenticated && user.role === "2" ? (
        <>
          <Header />
          <ConfirmDialog />
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
                    value={statusApprovedWords}
                    paginator
                    rows={10}
                    dataKey="id"
                    editMode="row"
                    onRowEditComplete={onRowEditComplete}
                    filters={filters}
                    filterDisplay="row"
                    loading={loading}
                    globalFilterFields={["word", "description"]}
                    header={header}
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
                      rowEditor={true}
                      headerStyle={{ width: "10%", minWidth: "8rem" }}
                      bodyStyle={{ textAlign: "center" }}
                      style={{ borderTopRightRadius: 15 }}
                    ></Column>
                    <Column
                      body={
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger"
                          onClick={confirm2}
                        />
                      }
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
                      dataKey="id"
                      value={filteredWordArray}
                      onChange={(e) => setFilteredWordArray(e.value)}
                      itemTemplate={itemTemplate}
                      header={
                        <div className="header-order-list">
                          <Searcher
                            forModal={true}
                            searchedWordF={searchedWordF}
                            isSearched={isSearched}
                          />
                        </div>
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
                    value={transformedData}
                    paginator
                    rows={10}
                    dataKey="id"
                    editMode="row"
                    onRowEditComplete={onRowEditComplete}
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
