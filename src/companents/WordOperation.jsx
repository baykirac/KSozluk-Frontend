import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import Searcher from "./Searcher";

import "../styles/WordOperation.css";
import wordApi from "../api/wordApi";

function WordOperation({
  visible,
  closingModal,
  word,
  description,
  isAdd,
  isSuccessfull,
  isDisabled,
  wordId,
}) {
  debugger;
  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [newDescription, setDescription] = useState(description);
  const [searchedWordId, setSearchedWordId] = useState(wordId);
  const toast = useRef(null);

  const setTheWord = (wordParam) => {
    setWord(wordParam);
  };


  const handleSubmit = async () => {
    setLoading(true);
    const response = await wordApi.AddWord(newWord, newDescription);
    if (response.isSuccess) {
      setLoading(false);
      toast.current.show({
        severity: "success",
        summary: "Başarılı",
        detail: response.message,
      });
      isSuccessfull(true);
    }
  };

  const recommendWord = () => {
    console.log(searchedWordId);
  };

  useEffect(() => {
    if (wordId !== undefined) {
      setSearchedWordId(wordId);
      debugger;
    }
  },[wordId]);
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
        <form onSubmit={handleSubmit}>
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
                setDescription(e.target.value);
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
        </form>
      </Dialog>
    </div>
  ) : (
    <div className="modal">
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
            value={description}
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
