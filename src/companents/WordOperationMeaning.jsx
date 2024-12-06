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
  const [descriptions, setDescriptions] = useState([{ id: 1, text: "" }]);
  const toast = useRef(null);

  const recommendMode = useSelector(
    (state) => state.descriptions.recommendMode
  );
  const searchedWordId = useSelector((state) => state.words.selectedWordId);
  const selectedDescriptionId = useSelector(
    (state) => state.descriptions.selectedDescriptionId
  );

  const isWordEntered = () => {
    const trimmedWord = newWord?.trim() || "";
    return trimmedWord !== "";
  };

  const isInputDisabled = isDisabled || !isWordEntered();

  const normalizeWord = (word) => {
    return word?.trim().toLowerCase() || "";
  };

  const setTheWord = (wordParam) => {
    setWord(normalizeWord(wordParam));
    setErrorMessage("");
  };

  const handleAddDescription = () => {
    if (!isWordEntered()) return;
    const newId = Math.max(...descriptions.map((d) => d.id)) + 1;
    setDescriptions([...descriptions, { id: newId, text: "" }]);
  };

  const handleRemoveDescription = (id) => {
    if (descriptions.length > 1) {
      const newDescriptions = descriptions.filter((desc) => desc.id !== id);
      setDescriptions(newDescriptions);
    }
  };

  const handleDescriptionChange = (id, newText) => {
    if (!isWordEntered()) return;
    const updatedDescriptions = descriptions.map((desc) =>
      desc.id === id ? { ...desc, text: newText } : desc
    );
    setDescriptions(updatedDescriptions);
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

  const handleSubmitWord = () => {
    const trimmedWord = normalizeWord(newWord);

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    if (recommendMode === 1 || recommendMode === 3) {
      const validDescriptions = descriptions
        .map((desc) => desc.text.trim())
        .filter((text) => text !== "");

      if (validDescriptions.length === 0) {
        setErrorMessage("En az bir anlam girilmelidir.");
        setLoading(false);
        return;
      }
    } else {
      if (description.trim() === "") {
        setErrorMessage("Anlam girilmelidir.");
        setLoading(false);
        return;
      }
    }

    setShowConfirm(true);
  };

  const confirmAdd = async () => {
    setLoading(true);
    const trimmedWord = normalizeWord(newWord);

    try {
      if (recommendMode === 1 || recommendMode === 3) {
        const validDescriptions = descriptions
          .map((desc) => desc.text.trim())
          .filter((text) => text !== "");

        for (const descText of validDescriptions) {
          const response = await wordApi.RecommendWord(trimmedWord, descText);

          if (!response.isSuccess) {
            toast.current.show({
              severity: "error",
              summary: "Hata",
              detail: response.message || "Öneri eklenirken bir hata oluştu.",
              life: 3000,
            });
            break;
          }
        }

        showToaster({ message: "Öneriler başarıyla eklendi." });
        setWord("");
        setDescriptions([{ id: 1, text: "" }]);
      } else {
        let response;
        if (recommendMode === 1) {
          response = await wordApi.RecommendWord(trimmedWord, description);
        } else if (recommendMode === 2) {
          response = await descriptionApi.RecommendDescription(
            searchedWordId,
            selectedDescriptionId,
            description
          );
        }

        if (response.isSuccess) {
          showToaster({ message: "Öneri başarıyla eklendi." });
          setWord("");
          setDescription("");
        } else {
          toast.current.show({
            severity: "error",
            summary: "Hata",
            detail: response.message || "Öneri eklenirken bir hata oluştu.",
            life: 3000,
          });
        }
      }

      if (isSuccessfull) {
        isSuccessfull(true);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "İşlem sırasında bir hata oluştu.",
        life: 3000,
      });
    }

    setLoading(false);
    setShowConfirm(false);
  };

  useEffect(() => {
    if (visible) {
      setDescription("");
      setDescriptions([{ id: 1, text: "" }]);
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
        acceptClassName="p-button-accept"
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
          <label htmlFor="description">Anlam Girin:</label>
          {recommendMode === 3 || recommendMode === 1 ? (
            // Çoklu anlam girişi (sadece recommendMode 1 ve 3 için)
            descriptions.map((desc) => (
              <div key={desc.id} className="flex align-items-center gap-2 mb-2">
                <InputTextarea
                  value={desc.text}
                  onChange={(e) =>
                    handleDescriptionChange(desc.id, e.target.value)
                  }
                  placeholder={
                    isWordEntered() ? "Öneride bulunun" : "Önce Kelime Girin"
                  }
                  disabled={isInputDisabled ? recommendMode === 3 : recommendMode === 1}
                  className="input-text-area-desc"
                  autoResize
                  rows={7}
                  cols={38}
                />
                <Button
                  icon="pi pi-plus"
                  className="p-button-rounded p-button-success-plus"
                  onClick={handleAddDescription}
                />
                <Button
                  icon="pi pi-minus"
                  className="p-button-rounded p-button-danger-minus"
                  onClick={() => handleRemoveDescription(desc.id)}
                  disabled={descriptions.length === 1}
                />
              </div>
            ))
          ) : (
            // Tek anlam girişi (diğer modlar için)
            <div className="flex align-items-center gap-2 mb-2">
              <InputTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isWordEntered() ? "Öneride bulunun" : "Önce Kelime Girin"
                }
                //disabled={isInputDisabled}
                className="input-text-area-desc"
                autoResize
                rows={7}
                cols={38}
              />
            </div>
          )}
        </div>
        <div className="p-field position-right">
          <Button
            className="add-button"
            icon="pi pi-plus"
            loading={loading}
            onClick={handleSubmitWord}
            label="Öner"
            disabled={
              recommendMode === 3 || recommendMode === 1
                ? !descriptions.some((desc) => desc.text.trim() !== "")
                : description.trim() === ""
            }
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WordOperationMeaning;
