import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import Searcher from "./Searcher";

import { useSelector } from "react-redux";

import "../styles/WordOperation.css";
import wordApi from "../api/wordApi";
import descriptionApi from "../api/descriptionApi";

function WordOperation({
  visible,
  closingModal,
  word,
  isAdd,
  isSuccessfull,
  isDisabled,
}) {
  const searchedWordId = useSelector((state) => state.words.selectedWordId);
  const recommendMode = useSelector(
    (state) => state.descriptions.recommendMode
  );
  const description = useSelector(
    (state) => state.descriptions.selectedDescription
  );
  const selectedDescriptionId = useSelector(
    (state) => state.descriptions.selectedDescriptionId
  );

  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [newDescription, setNewDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toast = useRef(null);

  const setTheWord = (wordParam) => {
    setWord(wordParam);
    setErrorMessage("");
  };

  const showToaster = (response) => {
    setLoading(false);
    toast.current.show({
      severity: "success",
      summary: "Başarılı",
      detail: response.message,
      life: 2500,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const trimmedWord = newWord.trim();
    
    
    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    const response = await wordApi.AddWords(trimmedWord, newDescription);
    if (response.isSuccess) {
      showToaster(response);
      setWord("");
      setNewDescription("");
    } else {
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: response.message || "Kelime eklenirken bir hata oluştu.",
        life: 3000,
      });
    }
    setLoading(false);
  };

  const handleSubmitWord = async () => {
    setLoading(true);
    const trimmedWord = newWord.trim();
    
    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    const response = await wordApi.AddWord(trimmedWord, newDescription);
    if (response.isSuccess) {
      showToaster(response);
      setWord("");
      setNewDescription("");
    } else {
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: response.message || "Kelime eklenirken bir hata oluştu.",
        life: 3000,
      });
    }
    setLoading(false);
  };

  const recommendWord = async () => {
    const trimmedWord = newWord.trim();

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      return;
    }

    setLoading(true);
    console.log("Kelime Id:" + searchedWordId);
    console.log("Öneri Modu:" + recommendMode);
    console.log("Yeni Açıklama:" + newDescription);
    console.log("Açıklamanın Id: " + selectedDescriptionId);
    if (recommendMode === 1 || recommendMode === 2) {
      const response = await descriptionApi.RecommendDescription(
        searchedWordId,
        selectedDescriptionId ? selectedDescriptionId : null,
        newDescription
      );
      if (response.isSuccess) {
        showToaster(response);
      }
    }
    if (recommendMode === 3) {
      const response = await wordApi.RecommendWord(trimmedWord, newDescription);
      if(response.isSuccess){
        showToaster(response);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      if(recommendMode !== 2){
        setNewDescription("");
      }
      else{
        setNewDescription(description);
      }
    }
  }, [visible, recommendMode, description]);

  return isAdd ? (
    <div className="modal">
      <Toast ref={toast} />
      <Dialog
        className="modal-dialog"
        header="Yeni Kelime ve Anlam Ekleyin"
        visible={visible}
        maximizable
        style={{ width: "40vw", padding: 3 }}
        onHide={() => {
          if (!visible) return;
          closingModal();
        }}
      >
        <div className="p-field">
          <label htmlFor="word">Kelime Girin:</label>
          <Searcher word={word} forModal={true} setTheWordF={setTheWord} />
          {errorMessage && <small className="p-error">{errorMessage}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="description">Açıklama Girin:</label>
          <InputTextarea
            className="description-area"
            autoResize
            rows={7}
            cols={32}
            value={newDescription}
            onChange={(e) => {
              setNewDescription(e.target.value);
            }}
          />
        </div>       
        <div className="p-field">
          <Button
            className="add-button"
            icon="pi pi-plus"
            loading={loading}
            onClick={handleSubmit}
            label="Kelime Ekle"
          />
        </div>
        <div className="p-field">
          <Button
            className="add-button"
            icon="pi pi-plus"
            loading={loading}
            onClick={handleSubmitWord}
            label="Anlam Ekle"
          />
        </div>
      </Dialog>
    </div>
  ) : (
    <div className="modal">
      <Toast ref={toast} />
      <Dialog
        className="modal-dialog"
        header="Öneride Bulun"
        visible={visible}
        maximizable
        style={{ width: "40vw", padding: 3 }}
        onHide={() => {
          if (!visible) return;
          closingModal();
        }}
      >
        <div className="p-field">
          <label htmlFor="word">Kelime Girin:</label>
          <Searcher
            word={word}
            forModal={true}
            setTheWordF={setTheWord}
            isDisabled={isDisabled}
          />
          {errorMessage && <small className="p-error">{errorMessage}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="description">Açıklama Girin:</label>
          <InputTextarea
            className="description-area"
            autoResize
            rows={7}
            cols={38}
            value={newDescription}
            onChange={(e) => {
              setNewDescription(e.target.value);
            }}
          />
        </div>
        <div className="p-field">
          <Button
            className="add-button"
            icon="pi pi-check"
            loading={loading}
            onClick={recommendWord}
            label="Öner"
          />
        </div>
      </Dialog>
    </div>
  );
}

export default WordOperation;