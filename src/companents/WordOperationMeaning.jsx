import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmDialog } from "primereact/confirmdialog";
import { RadioButton } from "primereact/radiobutton";
import Searcher from "./Searcher";
import { useSelector } from "react-redux";
import descriptionApi from "../api/descriptionApi";
import wordApi from "../api/wordApi";
import "../styles/WordOperation.css";

// eslint-disable-next-line react/prop-types
const WordOperationMeaning = ({visible, closingModal, word = "", isDisabled, isSuccessfull,
}) => {
  const [loading, setLoading] = useState(false);
  const [newWord, setWord] = useState(word);
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [descriptions, setDescriptions] = useState([{ id: 1, text: "" }]);
  const [textCase, setTextCase] = useState("lowercase");
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

  const toTurkishUpperCase = (text) => {
    return text.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();
  };

  const toTurkishLowerCase = (text) => {
    return text.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
  };

  const formatWord = (word) => {
    if (!word) return "";
    const trimmedWord = word.trim();

    switch (textCase) {
      case "capitalize":
        return (
          toTurkishUpperCase(trimmedWord.charAt(0)) +
          toTurkishLowerCase(trimmedWord.slice(1))
        );
      case "uppercase":
        return toTurkishUpperCase(trimmedWord);
      case "lowercase":
        return toTurkishLowerCase(trimmedWord);
      default:
        return trimmedWord;
    }
  };

  const setTheWord = (wordParam) => {
    setWord(formatWord(wordParam));
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
    if (newText.length > 2000) {
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "2000 karakter sınırını aşamazsınız.",
        life: 3000,
      });
      return;
    }

    const updatedDescriptions = descriptions.map((desc) =>
      desc.id === id ? { ...desc, text: newText } : desc
    );
    setDescriptions(updatedDescriptions);
  };

  const handleSingleDescriptionChange = (newText) => {
    if (newText.length > 2000) {
      toast.current.show({
        severity: "error",
        summary: "Karakter Sınırı",
        detail: "2000 karakter sınırını aşamazsınız.",
        life: 3000,
      });
      return;
    }
    setDescription(newText);
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
    const trimmedWord = formatWord(newWord);

    if (trimmedWord === "") {
      setErrorMessage("Kelime boş olamaz.");
      setLoading(false);
      return;
    }

    if (recommendMode === 3 && !textCase) {
      setErrorMessage("Lütfen bir metin biçimi seçin.");
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
    const trimmedWord = formatWord(newWord);

    try {
      if (recommendMode === 1 || recommendMode === 3) {
        const validDescriptions = descriptions
          .map((desc) => desc.text.trim())
          .filter((text) => text !== "");

        let _obj = {
          WordContent: trimmedWord,
          DescriptionContent: validDescriptions,
        };

        const response = await wordApi.RecommendWord(_obj);

        if (!response.success) {
          toast.current.show({
            severity: "error",
            summary: "Hata",
            detail: response.message || "Öneri eklenirken bir hata oluştu.",
            life: 3000,
          });
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

        if (response.success) {
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
      setTextCase(null);
      if (word) {
        setWord(formatWord(word));
      }
    }
  }, [visible, word]);

  const renderRadioButtons = () =>
    recommendMode === 3 &&
    isWordEntered() && (
      <>
        <div
          className="flex flex-row justify-content-start align-items-center mb-3"
          style={{
            padding: "20px 0 0 25px",
            fontSize: "14px",
          }}
        >
          <div
            className="flex align-items-center"
            style={{ marginRight: "1rem", marginBottom: "5px" }}
          >
            <RadioButton
              inputId="capitalize"
              name="textCase"
              value="capitalize"
              onChange={(e) => setTextCase(e.value)}
              checked={textCase === "capitalize"}
            />
            <label
              htmlFor="capitalize"
              style={{ marginLeft: "10px" }}
              className="ml-2"
            >
              İlk harfi büyük
            </label>
          </div>

          <div
            className="flex align-items-center"
            style={{ marginRight: "1rem", marginBottom: "5px" }}
          >
            <RadioButton
              inputId="uppercase"
              name="textCase"
              value="uppercase"
              onChange={(e) => setTextCase(e.value)}
              checked={textCase === "uppercase"}
            />
            <label
              htmlFor="uppercase"
              style={{ marginLeft: "10px" }}
              className="ml-2"
            >
              Tüm harfleri büyük
            </label>
          </div>

          <div
            className="flex align-items-center"
            style={{ marginRight: "1rem", marginBottom: "5px" }}
          >
            <RadioButton
              inputId="lowercase"
              name="textCase"
              value="lowercase"
              onChange={(e) => setTextCase(e.value)}
              checked={textCase === "lowercase"}
            />
            <label
              htmlFor="lowercase"
              style={{ marginLeft: "10px" }}
              className="ml-2"
            >
              Tüm harfleri küçük
            </label>
          </div>
        </div>

        {textCase === null && errorMessage && (
          <small className="p-error block mb-2">
            Lütfen bir metin biçimi seçin.
          </small>
        )}
      </>
    );

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
        acceptLabel="Evet"
        rejectLabel="Hayır"
        reject={() => setShowConfirm(false)}
      />
      <Dialog
        className="modal-dialog"
        header="Öneride Bulun"
        visible={visible}
        style={{ padding: 3 }}
        onHide={() => {
          if (!visible) return;
          closingModal();
        }}
      >
        <div className="p-field">
          <Searcher
            word={formatWord(word)}
            forModal={true}
            setTheWordF={setTheWord}
            isDisabled={isDisabled}
          />
          {renderRadioButtons()}
        </div>

        <div className="p-field">
          {recommendMode === 3 || recommendMode === 1 ? (
             descriptions.map((desc) => (
              <div key={desc.id} className="flex align-items-center gap-2 mb-2">
                <div className="input-text-area-container">
                  <InputTextarea
                    value={desc.text}
                    onChange={(e) =>
                      handleDescriptionChange(desc.id, e.target.value)
                    }
                    placeholder={
                      isWordEntered() ? "Öneride bulunun" : "Önce Kelime Girin"
                    }
                    disabled={
                      isInputDisabled
                        ? recommendMode === 3
                        : recommendMode === 1
                    }
                    className="input-text-area-desc"
                    autoResize
                    rows={7}
                    cols={52}
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
                   <span className="text-sm text-gray-500">
                  {desc.text.length}/2000
                </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex align-items-center gap-2 mb-2">
              <InputTextarea
                value={description}
                onChange={(e) => handleSingleDescriptionChange(e.target.value)}
                placeholder={
                  isWordEntered() ? "Öneride bulunun" : "Önce Kelime Girin"
                }
                className="input-text-area-desc"
                autoResize
                rows={7}
                cols={52}
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
