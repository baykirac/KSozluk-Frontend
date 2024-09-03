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

  const toast = useRef(null);

  const setTheWord = (wordParam) => {
    setWord(wordParam);
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
    debugger;
    setLoading(true);
    const response = await wordApi.AddWord(newWord, newDescription);
    if (response.isSuccess) {
      showToaster(response);
    }
  };

  const recommendWord = async () => {
    console.log("Kelime Id:" + searchedWordId);
    console.log("Öneri Modu:" + recommendMode);
    console.log("Yeni Açıklama:" + newDescription);
    console.log("Açıklamanın Id: " + selectedDescriptionId);
    if (recommendMode === 1 || recommendMode === 2) {
      debugger;
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
      debugger;
      const response = await wordApi.RecommendWord(newWord, newDescription);
      if(response.isSuccess){
        showToaster(response);
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setNewDescription(""); //açıklama giriniz kısmında önceki açıklamalar yazmasın
    }
  }, [description]);

  return isAdd ? (
    <div className="modal">
      <Toast ref={toast} />
      <Dialog
        className="modal-dialog"
        header="Yeni Kelime Ekleyin"
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
        </div>
        <div className="p-field">
          <label htmlFor="description">Açıklama Girin:</label>
          <InputTextarea
            className="description-area"
            autoResize
            rows={7}
            cols={34}
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
          ></Button>
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
          ></Button>
        </div>
      </Dialog>
    </div>
  );
}

export default WordOperation;
