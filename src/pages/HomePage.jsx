import React, { useCallback, useEffect, useState } from "react";
import Header from "../companents/Header";

import Searcher from "../companents/Searcher";
import AccerdionMenu from "../companents/AccerdionMenu";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { particlesConfig } from "../assets/particalConfig";

import { Button } from "primereact/button";

import WordOperation from "../companents/WordOperation";
import DescriptionField from "../companents/DescriptionField";

import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import "../App.css";

function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [openDescriptions, setOpenDescriptions] = useState(false);
  const [searchedWord, setSearchedWord] = useState("");
  const [searchedWordId, setSearchedWordId] = useState("");
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {});
  }, []);

  const particlesLoaded = (container) => {};

  const closingModalF = () => {
    setOpenModal(false);
  };

  const openDescription = () => {
    setOpenDescriptions(true);
  };

  const setTheSearchedWord = (word) => {
    setSearchedWord(word);
  };

  const setTheSearchedWordId = (id) => {
    setSearchedWordId(id);
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <Header />
          <div className="align-left">
            <AccerdionMenu
              isSearched={openDescription}
              forModal={false}
              searchedWordF={setTheSearchedWord}
              searchedWordIdF={setTheSearchedWordId}
            />
          </div>
          <div>
            <Searcher
              isSearched={openDescription}
              forModal={false}
              searchedWordF={setTheSearchedWord}
              searchedWordIdF={setTheSearchedWordId}
            />
          </div>
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={particlesConfig}
            className="particles-background"
          />
          <Button
            tooltip="Yeni kelime öner"
            tooltipOptions={{ showDelay: 250, position: "left" }}
            className="pi pi-plus floating-button"
            onClick={() => setOpenModal(true)}
          ></Button>
          <DescriptionField
            isSelected={openDescriptions}
            searchedWord={searchedWord}
            searchedWordId={searchedWordId}
          />
          <WordOperation visible={openModal} closingModal={closingModalF} isDisabled={false} wordId = {searchedWordId}/>
        </>
      ) : (
        <>{!isAuthenticated && <Navigate to="/SignIn" />}</>
      )}
    </>
  );
}

export default HomePage;
