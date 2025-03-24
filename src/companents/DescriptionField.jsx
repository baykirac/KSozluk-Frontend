import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import WordOperationMeaning from "./WordOperationMeaning";
import { RibbonContainer, Ribbon } from "react-ribbons";
import descriptionApi from "../api/descriptionApi";
import { useDispatch } from "react-redux";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
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
function DescriptionField({isSelected = false, searchedWord = "",searchedWordId = "",isSearched,searchedWordF,searchedWordIdF,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState([]);
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWordLike, setIsWordLike] = useState(false);
  const [topWords, setTopWords] = useState([]);
  const [timeWords, setTimeWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const dispatch = useDispatch();
  const toast = useRef(null);

  const handleDescriptionLikeClick = async (descriptionId) => {
    try {
      const response = await descriptionApi.LikeDescription(descriptionId);
      if (response.success) {
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
    if (isDisabled) return; 
  
    setIsDisabled(true); 
    try {
      const response = await wordApi.LikeWord(searchedWordId);
      if (response.success) {
        setIsWordLike(!isWordLike);
        await updateTopWords();
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.data.message,
        });
      }
    } catch (error) {
      console.error("Error handling like:", error);
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
      });
    } finally {
      setTimeout(() => setIsDisabled(false), 2000);
    }
  };

  const handleFavoriteClick = async (wordId) => {
    if (isDisabled) return; 
  
    setIsDisabled(true); 
    try {
      const response = await descriptionApi.FavouriteWord(wordId);

      if (response.success) {
        setIsFavorite(!isFavorite);
        await updateFavoriteWords();
      } else {
        toast.current.show({
          severity: "error",
          summary: "Hata",
          detail: response.data.message,
        });
      }
    } catch (error) {
      console.error("Error handling favourite:", error);
      toast.current.show({
        severity: "error",
        summary: "Hata",
        detail: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
      });
    }
    finally {
      setTimeout(() => setIsDisabled(false), 2000); 
    }
  };

  const closingModalF = () => {
    setOpenModal(false);
  };

  const GetDescriptionContent = async (wordId) => {
    const response = await descriptionApi.GetDescriptions(wordId);
    return response;
  };

  useEffect(() => {
    dispatch(setSelectedWordId(searchedWordId));
    fetchDescription(); 
  }, [searchedWord, searchedWordId]);
  
  const updateTopWords = async () => {
    try {
      const topListResponse = await wordApi.GetTopList();
      setTopWords(topListResponse.body);
    } catch (error) {
      console.error("Error updating top words:", error);
    }
  };
  
  const updateFavoriteWords = async () => {
    try {
      const favoriteWordsResponse = await descriptionApi.FavouriteWordsOnScreen();
      setFavoriteWords(favoriteWordsResponse.body);
    } catch (error) {
      console.error("Error updating favorite words:", error);
    }
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const topListResponse = await wordApi.GetTopList();
        setTopWords(topListResponse.body);
  
        const favoriteWordsResponse = await descriptionApi.FavouriteWordsOnScreen();
        setFavoriteWords(favoriteWordsResponse.body);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
  
    fetchInitialData();
  }, []);



  useEffect(() => {
    const fetchAllLastEdit = async () => {
      try {
        const response = await wordApi.GetLastEdit();
        const wordsWithDates = response.body.map((word) => ({
          ...word,
          lastEditedDate: new Date(word.lastEditedDate),
        }));
        setTimeWords(wordsWithDates);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllLastEdit();
  }, [])


  const fetchDescription = async () => {
    if (searchedWordId) {
      const response = await GetDescriptionContent(searchedWordId);
      setDescriptionArray(
        response.body.body.map((descriptions) => ({
          id: descriptions.id,
          descriptionContent: descriptions.descriptionContent,
          isLike: descriptions.isLike,
        }))
      );
      setIsFavorite(response.body.isFavourited);
      setIsWordLike(response.body.isLikedWord);
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
              {descriptionArray && descriptionArray.map((descriptions, index) => (
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
                {topWords && topWords?.length > 0 ? (
                  topWords.map((word, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTopWordClick(word)}
                    >
                      <div className="number-box">{index + 1}</div>
                      <div className="word-info">
                        <span className="word-name">{word.word}</span>
                        <span className="word-details">
                          {word.count} Kelime
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Henüz popüler kelime yok.</p>
                )}
              </div>
            </Card>

            <Card title="Favori Kelimelerim" className="card-sss">
              {favoriteWords && favoriteWords.length > 0 && (
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
                  )
                  )
                  }
                </div>
              )}
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
              <div
                className="top-list words-item d-flex flex-wrap align-items-center"
                style={{ gap: "0.6rem", flexDirection: "row" }}
              >
                {timeWords
                  .filter((word) => word.status === 1)
                  .map((word, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{
                        minWidth: "120px",
                      }}
                    >
                      <div className="words-info">
                        <span className="words-name">{word.wordContent}</span>{" "}
                        <span className="words-date">
                          {new Date(word.lastEditedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="card-sss">
              <span>
                © Başarsoft Bilgi Teknolojileri A.Ş. 1997 - 2024 | Tüm hakları
                saklıdır.
              </span>
              <div className="social-container">
                <div>
                  <br></br>
                  <span>İletişime Geçmek İçin </span>
                  <a
                    href="mailto:ik@basarsoft.com.tr" // Gmail web arayüzünde yeni e-posta oluşturma
                    target="_blank" // Yeni sekmede açılması için eklendi
                    style={{ color: "aqua", textDecoration: "underline" }}
                  >
                    ik@basarsoft.com.tr
                  </a>
                </div>
                <div className="social-icons">
                  <a
                    href="https://www.facebook.com/basarsoft/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook />
                  </a>
                  <a
                    href="https://www.instagram.com/basarsofttr/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/basarsoft/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href="https://www.youtube.com/user/basarsoftcbs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>
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
                {topWords && topWords?.length > 0 ? (
                  topWords.map((word, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTopWordClick(word)}
                    >
                      <div className="number-box">{index + 1}</div>
                      <div className="word-info">
                        <span className="word-name">{word.word}</span>
                        <span className="word-details">
                          {word.count} Kelime
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Henüz popüler kelime yok.</p>
                )}
              </div>
            </Card>

            <Card title="Favori Kelimelerim" className="card-sss">
              {favoriteWords && favoriteWords.length > 0 ? (
                <div className="favorite-words-list">
                  {favoriteWords && favoriteWords.map((word, index) => (
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
              ) : (
                <p>Favori kelimeniz bulunmamaktadır.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default DescriptionField;
