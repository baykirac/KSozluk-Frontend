import React, { useState, useEffect } from "react";

import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

import WordOperation from "./WordOperation";

import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";

import { RibbonContainer, Ribbon } from "react-ribbons";

import descriptionApi from "../api/descriptionApi";

import { useDispatch, useSelector } from "react-redux";

import "../styles/Descriptions.css";

function DescriptionField({ isSelected, searchedWord, searchedWordId }) {
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState("");
  const [runTips, setRunTips] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [descriptionArray, setDescriptionArray] = useState([]);

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
    const { action, index, origin, status, type } = data;

    if (status !== STATUS.FINISHED) {
      document.querySelector(".react-joyride__beacon").click();
    }
    document.querySelectorAll(".react-joyride__beacon").forEach((element) => {
      element.addEventListener("click", () => {
        document.querySelectorAll(".custom-header").forEach((element) => {
          element.style.display = "none";
        });
      });
    });

    if (status === STATUS.FINISHED) {
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
          body.map((descriptions) => ({
            id: descriptions.id,
            descriptionContent: descriptions.descriptionContent,
          }))
        );

      }
    };

    fetchDescription();
  }, [searchedWord]);
  return (
    <div>
      {isSelected ? (
        <div className="descriptions">
          <div className="card-list animate__animated animate__fadeIn">
            <div>
              <span
                style={{ fontSize: 24, fontWeight: "bold", display: "inline" }}
              >
                <em>“{searchedWord}”</em>
              </span>
              <span> kelimesi için sonuçlar</span>
            </div>
            <Button
              style={{
                marginTop: 20,
                padding: 10,
                borderRadius: 10,
                maxWidth: "20rem",
              }}
              icon="pi pi-plus"
              onClick={() => {
                setOpenModal(true);
                setDescription("");
              }}
            >
              <span style={{ marginLeft: 10, fontSize: 18 }}>
                {searchedWord} kelimesi için öneride bulun
              </span>
            </Button>
            {descriptionArray.map((descriptions, index) => (
              <div>
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
                  <Card key={index} className="custom-card">
                    <div className="card-content">
                      <div className="text-content">
                        <p>
                          <span className="first-letter">{descriptions.descriptionContent[0]}</span>{descriptions.descriptionContent.slice(1,descriptions.descriptionContent.length)}
                        </p>
                        <Button
                          tooltip="Kelimeye yeni anlam öner"
                          tooltipOptions={{ showDelay: 250, mouseTrack: true }}
                          onClick={() => {
                            setOpenModal(true);
                            setDescription(
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmodtempor incididunt ut labore et dolore magna aliqua."
                            );
                          }}
                          label="Öner"
                          icon="pi pi-pencil"
                          className="custom-button"
                        />
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
          />
        </div>
      ) : (
        <div className="tip-section">
          <Joyride
            steps={steps}
            run={runTips}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
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
            title="Kavramlar Sözlüğü Nedir?"
            className="card-sss"
            header={
              <img
                src="soru_isareti.png"
                style={{
                  padding: 10,
                  paddingTop: "2.1rem",
                  width: 90,
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            }
          >
            <p>
              Kavramlar sözlüğü şirkete dahil olan yeni ekip arkadaşlarımızın
              oryantasyon sürecini hızlandırıp kavramları benimsetmek amacıyla
              veya disiplinler arası çalışan çalışanlarımıza kolaylık sağlamak
              amacıyla oluşturulmuş bir uygulamadır.
            </p>
          </Card>
          <Card
            title="Neler Yapabilirim?"
            className="card-sss"
            header={
              <img
                src="dict.png"
                style={{
                  padding: 10,
                  paddingTop: "2rem",
                  width: 110,
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            }
          >
            <p>
              Sözlükte bulunan tüm kelimeleri alfabetik olarak görüntüleyebilir,
              kelime arayabilir, yeni kelime önerebilir, yeni kelimeye yeni
              anlam önerebilir veya mevcutta olan anlamlara öneride
              bulunabilirsiniz.
            </p>
            <Button onClick={() => setRunTips(true)}>İpuçlarını Göster</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DescriptionField;
