import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

import Searcher from "./Searcher";

import "../styles/WordOperation.css";

function WordOperation({ visible, closingModal, word, description, isAdd }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    //console.log("Kaydedildi");
  };

  const load = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return isAdd ? (
    <div className="modal">
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
            <Searcher word={word} forModal={true} />
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
              icon="pi pi-plus"
              loading={loading}
              onClick={load}
              label="Ekle"
            >
            </Button>
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
        <form onSubmit={handleSubmit}>
          <div className="p-field">
            <label htmlFor="word">Kelime Girin:</label>
            <Searcher word={word} forModal={true} />
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
              onClick={load}
              label="Öner"
            >
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default WordOperation;
