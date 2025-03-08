import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import Searcher from "./Searcher";
import wordApi from "../api/wordApi";
import "../styles/WordOperation.css";

// eslint-disable-next-line react/prop-types
const WordOperationOnly = ({ visible, closingModal, word, isSuccessfull }) => {
  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
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
    const trimmedWord = newWord.trim();

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      return;
    }

    setShowConfirm(true);
  };

  const confirmAdd = async () => {
    setLoading(true);
    const trimmedWord = newWord.trim();
    
    const response = await wordApi.AddWords(trimmedWord);
    if (response.success) {
      showToaster(response);
      setWord("");
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
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div className="modal">
      <Toast ref={toast} />
      <ConfirmDialog 
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message="Bu kelimeyi eklemek istediğinize emin misiniz?"
        header="Kelime Ekle"
        icon="pi pi-check-square"
        acceptClassName="p-button-success"
        accept={confirmAdd}
        acceptLabel="Evet"
        rejectLabel="Hayır"
        reject={() => setShowConfirm(false)}
      />
      <Dialog
        className="modal-dialog"
        header="Yeni Kelime Ekle"
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
            word={word}
            forModal={true}
            setTheWordF={setTheWord}
            isDisabled={false}
          />
          {errorMessage && <small className="p-error">{errorMessage}</small>}
        </div>
        <div className="p-field position-right">
          <Button
            className="add-button"
            icon="pi pi-plus"
            loading={loading}
            onClick={handleSubmit}
            label="Kelime Ekle"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default WordOperationOnly;