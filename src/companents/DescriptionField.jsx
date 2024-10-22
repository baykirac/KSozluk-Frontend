import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import WordOperation from "./WordOperation";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { RibbonContainer, Ribbon } from "react-ribbons";
import descriptionApi from "../api/descriptionApi";
import { useDispatch } from "react-redux";
import { setRecommendMode, setSelectedDescription, setSelectedDescriptionId } from "../data/descriptionSlice";
import { setSelectedWordId } from "../data/wordSlice";
import "../styles/Descriptions.css";
import { Tooltip } from 'primereact/tooltip';
import { AiFillLike } from "react-icons/ai";
import { AiFillStar } from "react-icons/ai";
import { AiFillEdit } from "react-icons/ai";

function DescriptionField({ isSelected, searchedWord, searchedWordId }) {
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState("");
  const [runTips, setRunTips] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [descriptionArray, setDescriptionArray] = useState([]);
  const [isLike, setIsLike] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWordLike, setIsWordLike] = useState(false);
  

  const handleLikeClickk = async (descriptionId) => {
      try {
         const _response = await descriptionApi.LikeDescription(descriptionId);
         debugger;

         if(_response.isSuccess){
          const tempArray = descriptionArray.map(x=> {
            if(x.id == descriptionId){
              return {...x,isLike:!x.isLike}
            }
            return x;
          })
          setDescriptionArray(tempArray);
         }
      }
    catch (error) {
          console.error('Error handling like:', error);
         }
  };

  const handleFavoriteClick = async (wordId) => {
    try{
    const _response = await descriptionApi.FavouriteWord(wordId);

    if(_response.isSuccess){
      setIsFavorite(!isFavorite);
     }
    // setIsFavorite(!isFavorite);
    // handleFavorite(descriptionId);

    }
    catch(error){
      console.error('Error handling favourite:', error);
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
      }
    };

    fetchDescription();
  }, [searchedWord, searchedWordId]);

  return (
    <div className="description-container">
      <div className="description-content">
        {isSelected ? (
          <div className="descriptions">
            <div className="card-list animate__animated animate__fadeIn">
              <div>
                <span style={{ fontSize: 24, fontWeight: "bold", display: "inline", marginLeft: 40}}>
                  <em>"{searchedWord}"</em>
                </span>
                <span> kelimesi için sonuçlar</span>
                <div
                id={`like-button-${searchedWord}`} /*bunu bi sor */
                
                className={`custom-button-like p-button-text`}
                tooltip="Beğen"
                tooltipOptions={{ position: 'top' }}
                style={{ display: 'inline-block', marginLeft: 10 }}
              >
                <AiFillLike />
              </div>

              <div
                        //  id={`favorite-button-${searchedWordId}`}
                          onClick={() => handleFavoriteClick(searchedWordId)}
                          className={`custom-button-star p-button-text ${isFavorite ? 'favorited' : ''}`}
                          tooltip="Favorilere Ekle"
                          tooltipOptions={{ position: 'top' }}
                        >
                          <AiFillStar />
                        </div>
              </div>
              <Button
                style={{
                  marginTop: 20,
                  padding: 10,
                  borderRadius: 10,
                  marginLeft: 40
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
                           onClick={() => handleLikeClickk(descriptions.id)}
                          //className={`custom-button-like p-button-text ${likedDescriptions.has(descriptions.id) ? 'liked' : ''}`}
                          className={`custom-button-like p-button-text ${descriptions.isLike ? 'liked' : ''}`}
                          tooltip="Beğen"
                          tooltipOptions={{ position: 'top' }}
                        >
                          <AiFillLike />
                        </div>

                        


                          <div
                            id={`recommend-button-${descriptions.id}`}
                            onClick={() => {
                              setOpenModal(true);
                              dispatch(setRecommendMode(2));
                              dispatch(setSelectedDescription(descriptions.descriptionContent));
                              dispatch(setSelectedDescriptionId(descriptions.id));
                            }}
                            className="custom-button-recommend p-button-text"
                            tooltip="Öneride Bulun"
                            tooltipOptions={{ position: 'top' }}
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
            <WordOperation
              visible={openModal}
              closingModal={closingModalF}
              word={searchedWord}
              description={description}
              isAdd={false}
              isDisabled={true}
            />
          </div>
        ) : (
          <div className="empty-state">
            <p>Lütfen sol taraftan bir kelime seçin veya arama yapın.</p>
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
       <Card title="Haftanın En Beğenilen Kelimeleri" className="card-sss">
          <ol>
            <li> Kelime - bengisu</li>
            <li> Kelime - bengisu</li>
            <li> Kelime - bengisu</li>
            <li> Kelime - bengisu</li>
            <li> Kelime - bengisu</li>
          </ol>
        </Card>
      <Card title="Favori Kelimeler" className="card-sss">
          <p>
            Yıldızlanan kelimeler burada gösterilecektir
          </p>
        </Card>
        <Card title="Öneriler" className="card-extra">
          <p>
            Eksik gördüğünüz kavramları bildirerek sözlüğümüzün gelişimine
            katkıda bulunabilirsiniz. Her katkınız değerlidir!
          </p>
        </Card>
        <Card title="Güncellemeler" className="card-extra">
          <p>
            Sözlüğümüz sürekli güncellenmektedir. En son eklenen kavramları
            ve yapılan güncellemeleri burada görebilirsiniz. Düzenli olarak
            kontrol etmeyi unutmayın!
          </p>
        </Card>
      </div>
    </div>
  );
}

export default DescriptionField;