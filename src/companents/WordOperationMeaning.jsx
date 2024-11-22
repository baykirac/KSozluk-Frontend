import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmDialog } from "primereact/confirmdialog";
import Searcher from "./Searcher";
import { useSelector } from "react-redux";
import descriptionApi from "../api/descriptionApi";
import wordApi from "../api/wordApi";
import "../styles/WordOperation.css";

const WordOperationMeaning = ({
  visible,
  closingModal,
  word = "",
  isAdd,
  isDisabled,
  isSuccessfull,
}) => {
  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useRef(null);
  const recommendMode = useSelector((state) => state.descriptions.recommendMode);
  const searchedWordId = useSelector((state) => state.words.selectedWordId);
  const selectedDescriptionId = useSelector((state) => state.descriptions.selectedDescriptionId);

  const isWordEntered = () => {
    return newWord.trim() !== "";
  };

  const normalizeWord = (word) => {
    return word.trim();
  };

  const setTheWord = (wordParam) => {
    setWord(normalizeWord(wordParam));
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

  const handleSubmitWord = async () => {
    const trimmedWord = normalizeWord(newWord);
    const trimmedDescription = description.trim();

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    if (trimmedDescription === "") {
      setErrorMessage("Açıklama girilmelidir.");
      setLoading(false);
      return;
    }

    setShowConfirm(true);  
  };

  const confirmAdd = async () => {
    setLoading(true);
    const trimmedWord = normalizeWord(newWord);
    const trimmedDescription = description.trim();

    if (recommendMode === 1 || recommendMode === 3) {
      const response = await wordApi.RecommendWord(trimmedWord, trimmedDescription);

      if (response.isSuccess) {
        showToaster({ message: "Öneri başarıyla eklendi." });
        setWord("");
        setDescription("");
        if (isSuccessfull) {
          isSuccessfull(true);
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.message || "Kelime eklenirken bir hata oluştu.",
          life: 3000,
        });
      }
    }

    if (recommendMode === 2) {
      const response = await descriptionApi.RecommendDescription(searchedWordId, selectedDescriptionId, trimmedDescription);

      if (response.isSuccess) {
        showToaster({ message: "Öneri başarıyla eklendi." });
        setWord("");
        setDescription("");
        if (isSuccessfull) {
          isSuccessfull(true);
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.message || "Kelime eklenirken bir hata oluştu.",
          life: 3000,
        });
      }
    }

    setLoading(false);
    setShowConfirm(false); 
  };

  useEffect(() => {
    if (visible) {
      setDescription("");
      if (word) {
        setWord(normalizeWord(word));
      }
    }
  }, [visible, word]);

  return (
    <div className="modal">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message="Bu kelimeyi önermek istediğinize emin misiniz?"
        header="Öner"
        icon="pi pi-check-square"
        acceptClassName="p-button-success"
        accept={confirmAdd} 
        reject={() => setShowConfirm(false)}  
      />
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
          <Searcher
            word={normalizeWord(word)}
            forModal={true}
            setTheWordF={setTheWord}
            isDisabled={isDisabled}
          />
          {errorMessage && <small className="p-error">{errorMessage}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="description">Açıklama Girin:</label>
          <div className="flex align-items-center gap-2 mb-2">
            <InputTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isWordEntered() ? "Öneride bulunun" : "Önce Kelime Girin"}
              disabled={!isWordEntered()}
              className="input-text-area-desc"
              autoResize
              rows={7}
              cols={38}
            />
          </div>
        </div>
        <div className="p-field position-right">
          <Button
            className="add-button"
            icon="pi pi-plus"
            loading={loading}
            onClick={handleSubmitWord}  
            label="Öner"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WordOperationMeaning;
