import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import WordOperationMeaning from "./WordOperationMeaning";
import { RibbonContainer, Ribbon } from "react-ribbons";
import descriptionApi from "../api/descriptionApi";
import { useDispatch } from "react-redux";
import {
  setRecommendMode,
  setSelectedDescription,
  setSelectedDescriptionId,
} from "../data/descriptionSlice";
import { setSelectedWordId } from "../data/wordSlice";
import "../styles/Descriptions.css";
import { AiFillLike } from "react-icons/ai";
import { AiFillStar } from "react-icons/ai";
import { AiFillEdit } from "react-icons/ai";
import wordApi from "../api/wordApi";
import { Toast } from "primereact/toast";

// eslint-disable-next-line react/prop-types
function DescriptionField({isSelected, searchedWord, searchedWordId, isSearched, searchedWordF, searchedWordIdF}) 
{
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState([]);
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWordLike, setIsWordLike] = useState(false);
  const [topWords, setTopWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const dispatch = useDispatch();
  const toast = useRef(null);

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
      } else {
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

  dispatch(setSelectedWordId(searchedWordId));
  const closingModalF = () => {
    setOpenModal(false);
  };

  const GetDescriptionContent = async (wordId) => {
    const response = await descriptionApi.GetDescriptions(wordId);
    return response;
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
    } catch (e) {
      console.error(e);
    }
  };

  const FavouriteWordsOnScreen = async () => {
    try {
      const response = await descriptionApi.FavouriteWordsOnScreen();
      setFavoriteWords(response.body.responseFavouriteWordsDtos);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDescription = async () => {
    if (searchedWordId) {
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

  const handleTopWordClick = (word) => {
    isSearched();
    searchedWordF(word.word);
    searchedWordIdF(word.wordId);
    dispatch(setSelectedWordId(word.wordId));
  };

  const handleFavoriteWordClick = (word) => {
    isSearched();
    searchedWordF(word.wordContent);
    searchedWordIdF(word.id);
    dispatch(setSelectedWordId(word.id));
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
                  <em>{searchedWord} </em>
                </span>
                <span style={{ fontSize: "18px" }}>
                  {" "}
                  kelimesi için sonuçlar
                </span>
                <div
                  id={`like-button-${searchedWord}`}
                  className={`custom-button-like p-button-text ${
                    isWordLike ? "liked" : ""
                  }`}
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
                  <div
                    key={index}
                    className="d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleTopWordClick(word)}
                  >
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
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleFavoriteWordClick(word)}
                    >
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
                  <div
                    key={index}
                    className="d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleTopWordClick(word);
                    }}
                  >
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
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleFavoriteWordClick(word)}
                    >
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
