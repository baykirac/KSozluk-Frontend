import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import Searcher from "./Searcher";
import { useSelector } from "react-redux";
import wordApi from "../api/wordApi";
import descriptionApi from "../api/descriptionApi";
import "../styles/WordOperation.css"
import { InputTextarea } from "primereact/inputtextarea";

const WordOperation = ({
  visible,
  closingModal,
  word ="",
  isAdd,
  isDisabled,
  isSuccessfull
}) => {
  const searchedWordId = useSelector((state) => state.words.selectedWordId);
  const recommendMode = useSelector((state) => state.descriptions.recommendMode);
  const description = useSelector((state) => state.descriptions.selectedDescription);
  const selectedDescriptionId = useSelector((state) => state.descriptions.selectedDescriptionId);

  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [descriptions, setDescriptions] = useState([{ id: 1, text: "" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);

  const isWordEntered = () => {
    return newWord.trim() !== "";
  }

  const normalizeWord = (word) => {
    return word.trim().toLowerCase();
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
    setLoading(true);
    const trimmedWord = normalizeWord(newWord);
    
    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    const validDescriptions = descriptions
      .map(desc => desc.text.trim())
      .filter(text => text !== "");

    if (validDescriptions.length === 0) {
      setErrorMessage("En az bir açıklama girilmelidir.");
      setLoading(false);
      return;
    }

    let isSuccess = true;
  
    for (const description of validDescriptions) {
      const response = await wordApi.AddWord(trimmedWord, description);
      if (!response.isSuccess) {
        isSuccess = false;
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.message || "Kelime eklenirken bir hata oluştu.",
          life: 3000,
        });
        break;
      }
    }

    if (isSuccess) {
      showToaster({ message: "Tüm açıklamalar başarıyla eklendi." });
      setWord("");
      setDescriptions([{ id: 1, text: "" }]);
      if (isSuccessfull) {
        isSuccessfull(true);
      }
    }
    
    setLoading(false);
  };

  const recommendWord = async () => {
    const trimmedWord = normalizeWord(newWord);

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      return;
    }

    setLoading(true);
    
    
    const validDescriptions = descriptions
      .map(desc => desc.text.trim())
      .filter(text => text !== "");

    if (validDescriptions.length === 0) {
      setErrorMessage("En az bir açıklama girilmelidir.");
      setLoading(false);
      return;
    }

    let isSuccess = true;
    
    for (const description of validDescriptions) {
      let response;
      if (recommendMode === 1 || recommendMode === 2) {
        response = await descriptionApi.RecommendDescription(
          searchedWordId,
          selectedDescriptionId ? selectedDescriptionId : null,
          description
        );
      } else if (recommendMode === 3) {
        response = await wordApi.RecommendWord(trimmedWord, description);
      }

      if (!response.isSuccess) {
        isSuccess = false;
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.message || "Öneri gönderilirken bir hata oluştu.",
          life: 3000,
        });
        break;
      }
    }

    if (isSuccess) {
      showToaster({ message: "Tüm öneriler başarıyla gönderildi." });
    }
    
    setLoading(false);
  };

  const handleAddDescription = () => {
    const newId = descriptions.length + 1;
    setDescriptions([...descriptions, { id: newId, text: "" }]);
  };

  const handleRemoveDescription = (id) => {
    if (descriptions.length > 1) {
      const newDescriptions = descriptions.filter(desc => desc.id !== id);
      setDescriptions(newDescriptions);
    }
  };

  const handleDescriptionChange = (id, newText) => {
    const updatedDescriptions = descriptions.map(desc =>
      desc.id === id ? { ...desc, text: newText } : desc
    );
    setDescriptions(updatedDescriptions);
  };

  useEffect(() => {
    if (visible) {  
      if(recommendMode !== 2){
        setDescriptions([{ id: 1, text: "" }]);
      }
      else{
        setDescriptions([{ id: 1, text: description }]);
      }
      if (word) {
        setWord(normalizeWord(word));
      }
    }
  }, [visible, recommendMode, description, word]);

  return (
    <div className="modal">
      <Toast ref={toast} />
      <Dialog
        className="modal-dialog"
        header={isAdd ? "Yeni Anlam Ekle" : "Öneride Bulun"}
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
          {descriptions.map((desc) => (
            <div key={desc.id} className="flex align-items-center gap-2 mb-2">
              <InputTextarea
                value={desc.text}
                onChange={(e) => handleDescriptionChange(desc.id, e.target.value)}
                placeholder={isWordEntered() ? "Açıklama girin" : "Önce kelime giriniz"}
                disabled= {!isWordEntered()}
                className="w-full"
                autoResize
                rows={7}
                cols={38}
              />
              <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-success-plus"
                onClick={handleAddDescription}
                disabled= {!isWordEntered()}
              />
              <Button
                icon="pi pi-minus"
                className="p-button-rounded p-button-danger-minus"
                onClick={() => handleRemoveDescription(desc.id)}
                disabled={descriptions.length === 1}
                
              />
            </div>
          ))}
        </div>
        <div className="p-field position-right">
          <Button
            className="add-button"
            icon={isAdd ? "pi pi-plus" : "pi pi-check"}
            loading={loading}
            onClick={isAdd ? handleSubmitWord : recommendWord}
            label={isAdd ? "Anlam Ekle" : "Öner"}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WordOperation;