import React, { useEffect, useState } from "react";
import Header from "../companents/Header";
import AccerdionMenu from "../companents/AccerdionMenu";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { particlesConfig } from "../assets/particalConfig";
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
  //const dispatch = useDispatch();


  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {});

    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const closingModalF = () => {
    setOpenModal(false);
  };

  const handleSearch = (isOpen, word, id) => {
    setOpenDescriptions(isOpen);
    if (word) setSearchedWord(word);
    if (id) setSearchedWordId(id);
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <Header onSearch={handleSearch} />
          <div className="align-left">
            <AccerdionMenu
              isSearched={() => handleSearch(true)}
              searchedWordF={setSearchedWord}
              searchedWordIdF={setSearchedWordId}
            />
          </div>
          <Particles
            id="tsparticles"
            particlesLoaded={() => {}}
            options={particlesConfig}
            className="particles-background"
          />
          <DescriptionField
            isSelected={openDescriptions}
            searchedWord={searchedWord}
            searchedWordId={searchedWordId}
          />
          <WordOperation
            visible={openModal}
            closingModal={closingModalF}
            isDisabled={false}
          />
        </>
      ) : (
        <>{!isAuthenticated && <Navigate to="/SignIn" />}</>
      )}
    </>
  );
}

export default HomePage;