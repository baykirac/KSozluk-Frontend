import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import WordOperationMeaning from "./WordOperationMeaning";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { RibbonContainer, Ribbon } from "react-ribbons";
import descriptionApi from "../api/descriptionApi";
import { useDispatch } from "react-redux";
import WordCloud from "react-d3-cloud";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import {
  setRecommendMode,
  setSelectedDescription,
  setSelectedDescriptionId,
} from "../data/descriptionSlice";
import { setSelectedWordId } from "../data/wordSlice";
import "../styles/Descriptions.css";
import { Tooltip } from "primereact/tooltip";
import { AiFillLike } from "react-icons/ai";
import { AiFillStar } from "react-icons/ai";
import { AiFillEdit } from "react-icons/ai";
import wordApi from "../api/wordApi";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

function DescriptionField({ isSelected, searchedWord, searchedWordId }) {
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState([]);
  const [runTips, setRunTips] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [isLike, setIsLike] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWordLike, setIsWordLike] = useState(false);
  const [topWords, setTopWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const toast = useRef(null);

  const schemeCategory10ScaleOrdinal = scaleOrdinal(schemeCategory10);

  const handleDescriptionLikeClick = async (descriptionId) => {
    try {
      const _response = await descriptionApi.LikeDescription(descriptionId);

      if (_response.isSuccess) {
        const tempArray = descriptionArray.map((x) => {
          if (x.id == descriptionId) {
            return { ...x, isLike: !x.isLike };
          }
          return x;
        });
        setDescriptionArray(tempArray);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleWordLikeClick = async () => {
    try {
      const _response = await wordApi.LikeWord(searchedWordId);
      if (_response.isSuccess) {
        setIsWordLike(!isWordLike);
        await GetTopList();
      }
      else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: _response.data.header.message,
        });
      }
      
    } catch (error) {
      console.error("Error handling like:", error);
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "Beğenme işlemi sırasında bir hata oluştu",
      });
    }
  };

  const handleFavoriteClick = async (wordId) => {
    try {
      const response = await descriptionApi.FavouriteWord(wordId);

      if (response.data.header.isSuccess) {
        setIsFavorite(!isFavorite);
        await FavouriteWordsOnScreen();
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.data.header.message,
        });
      }
    } catch (error) {
      console.error("Error handling favourite:", error);
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "Favori işlemi sırasında bir hata oluştu",
      });

      return;
    }
  };

  const dispatch = useDispatch();
  dispatch(setSelectedWordId(searchedWordId));
  const closingModalF = () => {
    setOpenModal(false);
  };

  const GetDescriptionContent = async (wordId) => {
    const response = await descriptionApi.GetDescriptions(wordId);
    return response;
  };

  const steps = [
    {
      target: ".p-accordion-header-link",
      content: "Kelimeleri buradan görüntüle.",
    },
    {
      target: ".p-autocomplete-input",
      content: "Buradan kelimeleri arayabilirsiniz.",
    },
    {
      target: ".floating-button",
      content: "Buradan kelime ve anlam ekleyebilirsiniz.",
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if (status === STATUS.RUNNING) {
      document.querySelector(".react-joyride__beacon")?.click();
    }
    document.querySelectorAll(".react-joyride__beacon").forEach((element) => {
      element.addEventListener("click", () => {
        document.querySelectorAll(".custom-header").forEach((element) => {
          element.style.display = "none";
        });
      });
    });

    if (type === EVENTS.TOUR_END || status === STATUS.FINISHED) {
      setRunTips(false);
      setStepIndex(0);
    }
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      document.querySelectorAll(".custom-header").forEach((element) => {
        element.style.display = "";
      });
      setRunTips(false);
      setStepIndex(0);
    }
  };

  useEffect(() => {
    GetTopList();
    fetchDescription();
    FavouriteWordsOnScreen();
  }, [searchedWord, searchedWordId]);

  const GetTopList = async () => {
    try {
      const response = await wordApi.GetTopList();
      setTopWords(response.body.responseTopWordListDtos);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  const FavouriteWordsOnScreen = async () => {
    try {
      const response = await descriptionApi.FavouriteWordsOnScreen();
      setFavoriteWords(response.body.responseFavouriteWordsDtos);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDescription = async () => {
    if (searchedWord) {
      const response = await GetDescriptionContent(searchedWordId);
      const { body } = response;
      setDescriptionArray(
        body.body.map((descriptions) => ({
          id: descriptions.id,
          descriptionContent: descriptions.descriptionContent,
          isLike: descriptions.isLike,
        }))
      );
      setIsFavorite(body.isFavourited);
      setIsWordLike(body.isLikedWord);
    }
  };

  return (
    <div className="description-container">
      <Toast ref={toast} />
      {/* <DigitalBackground /> */}
      <div className="description-content">
        {isSelected ? (
          <div className="descriptions">
            <div className="card-list animate__animated animate__fadeIn">
              <div>
                <span
                  style={{
                    fontSize: 25,
                    fontWeight: "bold",
                    display: "inline",
                    marginLeft: 40,
                  }}
                >
                  <em>"{searchedWord}"</em>
                </span>
                <span style={{ fontSize: "18px" }}>
                  {" "}
                  kelimesi için sonuçlar
                </span>
                <div
                  id={`like-button-${searchedWord}`} /*bunu bi sor */
                  className={`custom-button-like p-button-text ${
                    isWordLike ? "liked" : ""
                  }`}
                  tooltip="Beğen"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => {
                    handleWordLikeClick(searchedWordId);
                  }}
                  // onClick={confirmWordLike}
                  style={{ display: "inline-block", marginLeft: 10 }}
                >
                  <AiFillLike />
                </div>

                <div
                  //  id={`favorite-button-${searchedWordId}`}
                  onClick={() => handleFavoriteClick(searchedWordId)}
                  className={`custom-button-star p-button-text ${
                    isFavorite ? "favorited" : ""
                  }`}
                  tooltip="Favorilere Ekle"
                  tooltipOptions={{ position: "top" }}
                >
                  <AiFillStar />
                </div>
              </div>
              <Button
                className="recommend-style"
                style={{
                  marginTop: 20,
                  padding: 10,
                  borderRadius: 10,
                  marginLeft: 40,
                }}
                icon="pi pi-plus"
                onClick={() => {
                  setOpenModal(true);
                  setDescription("");
                  dispatch(setRecommendMode(1));
                  dispatch(setSelectedDescription(""));
                }}
              >
                <span style={{ marginLeft: 10, fontSize: 18, color: "white" }}>
                  {searchedWord} kelimesi için öneride bulun
                </span>
              </Button>
              {descriptionArray.map((descriptions, index) => (
                <div key={descriptions.id}>
                  <RibbonContainer>
                    <Ribbon
                      side="left"
                      type="edge"
                      size="large"
                      backgroundColor="#06B6D4"
                      color="#ffffff"
                      fontFamily="serif"
                      withStripes={true}
                    >
                      {index + 1}
                    </Ribbon>
                    <Card className="custom-card">
                      <div className="card-content">
                        <div className="text-content">
                          <p>
                            <span className="first-letter">
                              {descriptions.descriptionContent[0]}
                            </span>
                            {descriptions.descriptionContent.slice(1)}
                          </p>

                          <div className="action-buttons">
                            <div
                              id={`like-button-${descriptions.id}`}
                              onClick={() =>
                                handleDescriptionLikeClick(descriptions.id)
                              }
                              //className={`custom-button-like p-button-text ${likedDescriptions.has(descriptions.id) ? 'liked' : ''}`}
                              className={`custom-button-like p-button-text ${
                                descriptions.isLike ? "liked" : ""
                              }`}
                              tooltip="Beğen"
                              tooltipOptions={{ position: "top" }}
                            >
                              <AiFillLike />
                            </div>

                            <div
                              id={`recommend-button-${descriptions.id}`}
                              onClick={() => {
                                setOpenModal(true);
                                dispatch(setRecommendMode(2));
                                dispatch(
                                  setSelectedDescription(
                                    descriptions.descriptionContent
                                  )
                                );
                                dispatch(
                                  setSelectedDescriptionId(descriptions.id)
                                );
                              }}
                              className="custom-button-recommend p-button-text"
                              tooltip="Öneride Bulun"
                              tooltipOptions={{ position: "top" }}
                            >
                              <AiFillEdit />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </RibbonContainer>
                </div>
              ))}
            </div>
            <WordOperationMeaning
              visible={openModal}
              closingModal={closingModalF}
              word={searchedWord}
              description={description}
              isAdd={false}
              isDisabled={true}
            />
          </div>
        ) : (
          <div className="cards-container">
            <Card className="card-sss" style={{ color: "white" }}>
              <div className="card-header">
                <h3 className="card-title">Kelime Öner</h3>
                <Button
                  tooltip="Yeni kelime öner"
                  tooltipOptions={{ showDelay: 250, position: "left" }}
                  icon="pi pi-plus"
                  className="floating-button"
                  onClick={() => {
                    setOpenModal(true);
                    dispatch(setRecommendMode(3));
                  }}
                />
              </div>

              <p>
                Eksik gördüğünüz kavramları bildirerek sözlüğümüzün gelişimine
                katkıda bulunabilirsiniz. Her katkınız değerlidir!
              </p>
              <span>İletişim için: </span>
              <a
                href="ik@basarsoft.com.tr"
                style={{ color: "aqua", textDecoration: "underline" }}
              >
                ik@basarsoft.com.tr
              </a>

              <WordOperationMeaning
                visible={openModal}
                closingModal={closingModalF}
                isDisabled={false}
              />
            </Card>

            <Card title="En Beğenilenler" className="card-sss">
              <div
                className="top-list d-flex flex-column"
                style={{ gap: "0.6rem" }}
              >
                {topWords.map((word, index) => (
                  <div key={index} className="d-flex align-items-center">
                    <div className="number-box">{index + 1}</div>
                    <div className="word-info">
                      <span className="word-name">{word.word}</span>
                      <span className="word-details">{word.count} Kelime</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Favori Kelimelerim" className="card-sss">
              {favoriteWords.length > 0 && (
                <div className="favorite-words-list">
                  {favoriteWords.map((word, index) => (
                    <div key={index} className="d-flex align-items-center">
                      <div className="star-icon">
                        <i className="pi pi-star-fill" />
                      </div>
                      <div className="word-info-favorite">
                        <span className="word-name">{word.wordContent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="Güncellemeler"
              className="card-sss"
              style={{ color: "white" }}
            >
              {/* <Steps model={timeline} /> */}
              <p>
                Sözlüğümüz sürekli güncellenmektedir. En son eklenen kavramları
                ve yapılan güncellemeleri burada görebilirsiniz. Düzenli olarak
                kontrol etmeyi unutmayın!
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className={`tip-section ${isSelected ? "with-cards" : ""}`}>
        {isSelected && (
          <div className="tip-section-cards">
            <Card title="En Beğenilenler" className="card-sss">
              <div
                className="top-list d-flex flex-column"
                style={{ gap: "0.6rem" }}
              >
                {topWords.map((word, index) => (
                  <div key={index} className="d-flex align-items-center">
                    <div className="number-box">{index + 1}</div>
                    <div className="word-info">
                      <span className="word-name">{word.word}</span>
                      <span className="word-details">{word.count} Kelime</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Favori Kelimelerim" className="card-sss">
              {favoriteWords.length > 0 && (
                <div className="favorite-words-list">
                  {favoriteWords.map((word, index) => (
                    <div key={index} className="d-flex align-items-center">
                      <div className="star-icon">
                        <i className="pi pi-star-fill" />
                      </div>
                      <div className="word-info-favorite">
                        <span className="word-name">{word.wordContent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="Öneriler"
              className="card-sss"
              style={{ color: "white" }}
            >
              <p>
                Eksik gördüğünüz kavramları bildirerek sözlüğümüzün gelişimine
                katkıda bulunabilirsiniz. Her katkınız değerlidir!
              </p>
              <span>İletişim için: </span>
              <a
                href="mailto: ik@basarsoft.com.tr"
                style={{ color: "aqua", textDecoration: "underline" }}
              >
                ik@basarsoft.com.tr
              </a>
            </Card>

            <Card
              title="Güncellemeler"
              className="card-sss"
              style={{ color: "white" }}
            >
              <p>
                Sözlüğümüz sürekli güncellenmektedir. En son eklenen kavramları
                ve yapılan güncellemeleri burada görebilirsiniz. Düzenli olarak
                kontrol etmeyi unutmayın!
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default DescriptionField;
