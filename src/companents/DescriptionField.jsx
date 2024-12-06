import React, { useState, useEffect } from "react";
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

function DescriptionField({ isSelected, searchedWord, searchedWordId }) {
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState("");
  const [runTips, setRunTips] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [isLike, setIsLike] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWordLike, setIsWordLike] = useState(false);
  const [topWords, setTopWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);

  const data = [
    { text: "başarsoft", value: 120 },
    { text: "poi", value: 4 },
    { text: "cbs", value: 3 },
    { text: "harita", value: 4 },
    { text: "ağ", value: 5 },
    { text: "merhaba", value: 6 },
    { text: "dünya", value: 7 },
    { text: "örnek", value: 8 },
    { text: "test", value: 9 },
    { text: "veri", value: 15 },
    { text: "metin", value: 1 },
    { text: "deneme", value: 2 },
    { text: "günler", value: 3 },
    { text: "yazılım", value: 4 },
    { text: "proje", value: 5 },
    { text: "sonuç", value: 6 },
    { text: "analiz", value: 7 },
    { text: "çözümler", value: 8 },
    { text: "yönetim", value: 9 },
    { text: "işleme", value: 10 },
    { text: "sonuçlar", value: 1 },
    { text: "çözümler", value: 2 },
    { text: "görsel", value: 3 },
    { text: "doküman", value: 4 },
    { text: "memnuniyet", value: 5 },
    { text: "kalite", value: 6 },
    { text: "geliştirme", value: 7 },
    { text: "bilgi", value: 8 },
    { text: "planlama", value: 9 },
    { text: "birlik", value: 10 },
    { text: "ekip", value: 1 },
    { text: "deneyim", value: 2 },
    { text: "öneriler", value: 3 },
    { text: "testler", value: 4 },
    { text: "inceleme", value: 5 },
    { text: "fikirler", value: 6 },
    { text: "tasarım", value: 7 },
    { text: "strateji", value: 8 },
    { text: "verim", value: 9 },
    { text: "inceleme", value: 10 },
    { text: "öneriler", value: 1 },
    { text: "gelişim", value: 2 },
    { text: "değerlendirme", value: 3 },
    { text: "prensipler", value: 4 },
    { text: "süreç", value: 5 },
    { text: "rapor", value: 6 },
    { text: "içerik", value: 7 },
    { text: "teknik", value: 8 },
    { text: "kullanıcı", value: 9 },
    { text: "güvenlik", value: 10 },
    { text: "hizmet", value: 1 },
    { text: "kayıt", value: 2 },
    { text: "ağ", value: 3 },
    { text: "hata", value: 4 },
    { text: "durum", value: 5 },
    { text: "zaman", value: 6 },
    { text: "model", value: 7 },
    { text: "tablo", value: 8 },
    { text: "grafik", value: 9 },
    { text: "sunum", value: 10 },
    { text: "iş", value: 1 },
    { text: "açıklama", value: 2 },
    { text: "işlem", value: 3 },
    { text: "yönetici", value: 4 },
    { text: "yöntem", value: 5 },
    { text: "formül", value: 6 },
    { text: "çalışma", value: 7 },
    { text: "hesaplama", value: 8 },
    { text: "çözüm", value: 9 },
  ];

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
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleFavoriteClick = async (wordId) => {
    try {
      const _response = await descriptionApi.FavouriteWord(wordId);

      if (_response.isSuccess) {
        setIsFavorite(!isFavorite);
        await FavouriteWordsOnScreen();
      }
    } catch (error) {
      console.error("Error handling favourite:", error);
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
                <span style={{ marginLeft: 10, fontSize: 18 }}>
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
          <div style={{ userSelect: "none" , opacity: "0.8"}}>
            <WordCloud
              data={data}
              width={500}
              height={320}
              font="Itim"
              fontStyle="italic"
              fontWeight="bold"
              fontSize={(word) => Math.log2(word.value) * 8}
              //spiral="rectangular"
              rotate={0}
              padding={1}
              // random={Math.random}
              fill={(d, i) => schemeCategory10ScaleOrdinal(i)}
              onWordClick={(event, d) => {
                console.log(`onWordClick: ${d.text}`);
              }}
            />
          </div>
        )}
      </div>

      <div className="tip-section">
        <Joyride
          steps={steps}
          run={runTips}
          stepIndex={stepIndex}
          continuous
          showProgress
          showSkipButton
          scrollToFirstStep
          disableOverlayClose={true}
          styles={{
            options: {
              zIndex: 1000,
              width: 200,
            },
          }}
          callback={handleJoyrideCallback}
          locale={{
            back: "Geri",
            close: "Kapat",
            next: "Sıradaki",
            last: "Son",
            skip: "Atla",
          }}
        />
        <Card
          title="En Beğenilenler"
          className="card-sss"
          style={{ width: "100%" }}
        >
          <div
            className="top-list d-flex flex-column"
            style={{ gap: "0.6rem" }}
          >
            {topWords.map((word, index) => (
              <div key={index} className="d-flex align-items-center">
                <div className="number-box">{index + 1}</div>
                <div className="word-info">
                  <span className="word-name" >{word.word}</span>
                  <span className="word-details">{word.count} Kelime</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Favori Kelimeler"
          className="card-sss"
          style={{ width: "100%" }}
        >
          {favoriteWords.length > 0 && (
            <div className="favorite-words-list">
              {favoriteWords.map((word, index) => (
                <div key={index} className="d-flex align-items-center">
                  {/* <div className="number-box">{index + 1}</div> */}
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
        <Card title="Öneriler" className="card-sss">
          <p>
            Eksik gördüğünüz kavramları bildirerek sözlüğümüzün gelişimine
            katkıda bulunabilirsiniz. Her katkınız değerlidir!
          </p>
          <span>İletişim için: </span>
          <a
            href="ik@basarsoft.com.tr"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            ik@basarsoft.com.tr
          </a>
        </Card>
        <Card title="Güncellemeler" className="card-sss">
          <p>
            Sözlüğümüz sürekli güncellenmektedir. En son eklenen kavramları ve
            yapılan güncellemeleri burada görebilirsiniz. Düzenli olarak kontrol
            etmeyi unutmayın!
          </p>
        </Card>
      </div>
    </div>
  );
}

export default DescriptionField;
