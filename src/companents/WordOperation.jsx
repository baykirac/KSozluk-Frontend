import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import Searcher from "./Searcher";
import { useSelector } from "react-redux";
import wordApi from "../api/wordApi";
import "../styles/WordOperation.css";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmDialog } from "primereact/confirmdialog";
import descriptionApi from "../api/descriptionApi";

// eslint-disable-next-line react/prop-types
const WordOperation = ({visible, closingModal, word = "", isDisabled, isSuccessfull}) => {
  const recommendMode = useSelector(
    (state) => state.descriptions.recommendMode
  );
  const description = useSelector(
    (state) => state.descriptions.selectedDescription
  );

  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [descriptions, setDescriptions] = useState([{ id: 1, text: "" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingWord, setExistingWord] = useState(false);
  const [savedDescriptions, setSavedDescriptions] = useState([]);
  const toast = useRef(null);

  const isWordEntered = () => {
    const trimmedWord = newWord?.trim() || "";
    return trimmedWord !== "";
  };

  const normalizeWord = (word) => {
    return word?.trim().toLowerCase() || "";
  };

  const handleWordChange = async (value) => {
    const normalizedWord = normalizeWord(value);
    setWord(normalizedWord);
    setErrorMessage("");
    console.error(errorMessage, "");

    if (normalizedWord.length > 0) {
      await descriptionList(normalizedWord);
    } else {
      setDescriptions([{ id: 1, text: "" }]);
      setExistingWord(false);
    }
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

  const descriptionList = async (wordContent) => {
    if (wordContent.trim() !== "") {
      try {
        const response = await descriptionApi.HeadersDescription(wordContent);
        if (
          response.body?.descriptions &&
          response.body.descriptions.length > 0
        ) {
          setSavedDescriptions(response.body.descriptions);
          setExistingWord(true);
          toast.current.show({
            severity: "success",
            summary: "Başarılı",
            detail: response.message,
            life: 2500,
          });
        } else {
          setSavedDescriptions([]);
          setDescriptions([{ id: 1, text: "" }]);
          setExistingWord(false);
        }
      } catch (error) {
        console.error("Error fetching descriptions:", error);
        setDescriptions([{ id: 1, text: "" }]);
        setExistingWord(false);
      }
    } else {
      setDescriptions([{ id: 1, text: "" }]);
      setExistingWord(false);
    }
  };

  const confirmAdd = async () => {
    setLoading(true);
    const trimmedWord = normalizeWord(newWord);

    const validDescriptions = descriptions
      .map((desc) => desc.text.trim())
      .filter((text) => text !== "");

    let _obj = {
      WordContent: trimmedWord,
      Description: validDescriptions,
    };

    try {
      const response = await wordApi.AddWord(_obj);
      if (response.success) {
        const message = existingWord
          ? "Yeni anlamlar başarıyla eklendi."
          : "Kelime ve anlamlar başarıyla eklendi.";
        showToaster({ message });
        setWord("");
        setDescriptions([{ id: 1, text: "" }]);
        setExistingWord(false);
        if (isSuccessfull) {
          isSuccessfull(true);
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.message || "İşlem sırasında bir hata oluştu.",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding word/description:", error);
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

  const handleSubmitWord = () => {
    const trimmedWord = normalizeWord(newWord);
    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      return;
    }

    const validDescriptions = descriptions
      .map((desc) => desc.text.trim())
      .filter((text) => text !== "");

    if (validDescriptions.length === 0) {
      setErrorMessage("En az bir anlam girilmelidir.");
      return;
    }

    setShowConfirm(true);
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

  useEffect(() => {
    if (visible) {
      if (recommendMode !== 2) {
        setDescriptions([{ id: 1, text: "" }]);
      } else {
        setDescriptions([{ id: 1, text: description || "" }]);
      }
      if (word) {
        handleWordChange(normalizeWord(word));
      } else {
        setWord("");
        setExistingWord(false);
      }
    }
  }, [visible, recommendMode, description, word]);

  const isInputDisabled = isDisabled || !isWordEntered();

  return (
    <div className="modal">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message={
          existingWord
            ? "Mevcut kelimeye yeni anlamlar eklenecektir. Onaylıyor musunuz?"
            : "Yeni kelime ve anlamlar eklenecektir. Onaylıyor musunuz?"
        }
        header={existingWord ? "Anlam Ekle" : "Kelime ve Anlam Ekle"}
        icon="pi pi-check-square"
        acceptClassName="p-button-accept"
        accept={confirmAdd}
        acceptLabel="Evet"
        rejectLabel="Hayır"
        reject={() => setShowConfirm(false)}
      />
      <Dialog
        className="modal-dialog"
        header={
          existingWord
            ? "Mevcut Kelimeye Anlam Ekle"
            : "Yeni Kelime ve Anlam Ekle"
        }
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
            setTheWordF={handleWordChange}
            isDisabled={isDisabled}
            onChange={(e) => handleWordChange(e.target.value)}
          />
        </div>
        <div className="description-list">
          {savedDescriptions.map((s, index) => (
            <InputTextarea
              value={s.descriptionContent}
              key={index}
              className="existing-descriptions"
              autoResize
              disabled
            ></InputTextarea>
          ))}
        </div>

        <div className="p-field">
          <label htmlFor="description"></label>
          {descriptions.map((desc) => (
            <div key={desc.id} className="flex align-items-center gap-2 mb-2">
              <div className="input-text-area-container">
                <InputTextarea
                  value={desc.text}
                  onChange={(e) =>
                    handleDescriptionChange(desc.id, e.target.value)
                  }
                  placeholder={
                    isWordEntered() ? "Anlam girin" : "Önce Kelime Giriniz"
                  }
                  disabled={isInputDisabled}
                  className="input-text-area-desc"
                  autoResize
                  rows={7}
                  cols={52}
                />
                <Button
                  icon="pi pi-plus"
                  className="p-button-rounded p-button-success-plus"
                  onClick={handleAddDescription}
                  disabled={isInputDisabled}
                />
                <Button
                  icon="pi pi-minus"
                  className="p-button-rounded p-button-danger-minus"
                  onClick={() => handleRemoveDescription(desc.id)}
                  disabled={descriptions.length === 1 || isInputDisabled}
                />
              </div>
              {/* <div className="text-sm text-gray-500">
                {desc.text.length}/2000
              </div> */}
            </div>
          ))}
        </div>
        <div className="p-field position-right">
          <Button
            className="add-button"
            icon={"pi pi-plus"}
            loading={loading}
            onClick={handleSubmitWord}
            label={existingWord ? "Anlam Ekle" : "Yeni Kelime ve Anlam Ekle"}
            disabled={
              isInputDisabled ||
              !descriptions.some((desc) => desc.text.trim() !== "")
            }
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WordOperation;
