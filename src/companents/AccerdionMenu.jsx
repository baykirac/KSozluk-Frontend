import React from "react";
import { useState, useEffect } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { VirtualScroller } from "primereact/virtualscroller";
import { Skeleton } from "primereact/skeleton";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentWords, setSelectedWordId } from "../data/wordSlice";

import wordApi from "../api/wordApi";

import "../styles/AccerdionMenu.css";

function AccerdionMenu({ isSearched, searchedWordF, searchedWordIdF }) {
  const dispatch = useDispatch();

  const [hoveredTab, setHoveredTab] = useState(null);
  const [pageNumber, setPageNumber] = useState(2);
  const [currentLetter, setCurrentLetter] = useState("");
  const [allWords, setAllWords] = useState([]);
  const [loadedAllWords, setLoadedAllWords] = useState(false);
  const [loading, setLoading] = useState(false);
  const words = useSelector((state) => state.words.paginatedWords);

  const handleMouseEnter = (index) => {
    setHoveredTab(index);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const handleScroll = async (event, letter) => {
    if (!loadedAllWords) {
      const bottom =
        event.target.clientHeight + event.target.scrollTop + 0.5 >
        event.target.scrollHeight;
      if (bottom) {
        setPageNumber(pageNumber + 1);
        setLoading(true);
        const response = await wordApi.GetWordsByLetter(letter, pageNumber, 5);

        if (response.isSuccess) {
          setLoading(false);
          const { body } = response;
          const newWordContents = body
            .map((wordObj) => ({
              id: wordObj.id,
              wordContent: wordObj.wordContent,
            }));
          setAllWords((prevWords) => [...prevWords, ...newWordContents]);
          if (newWordContents.length < 5) {
            setLoadedAllWords(true);
            return;
          }
        }
      }
    }
  };

  const handleAccordionTabClick = async (letter) => {
    setLoading(true);
    const response = await wordApi.GetWordsByLetter(letter, 1, 5);
    if (response.isSuccess) {
      setAllWords([]);
      setPageNumber(2);
      setLoadedAllWords(false);
      setLoading(false);
      const { body } = response;
      const newWordContents = body
        .map((wordObj) => ({
          id: wordObj.id,
          wordContent: wordObj.wordContent,
        }));

      setAllWords((prevWords) => [...prevWords, ...newWordContents]);

      setCurrentLetter(letter);
    }
  };

  const itemTemplate = (word, options) => {
    return (
      <>
        {loading ? (
          <>
            <Skeleton width="100%" height="2rem" />
          </>
        ) : (
          <>
            <div
              key={options.index}
              className="accordion-word"
              onClick={() => {
                isSearched();
                searchedWordF(word.wordContent);
                searchedWordIdF(word.id);
                dispatch(setSelectedWordId(word.id));
              }}
            >
              {word.wordContent.charAt(0).toUpperCase() + word.wordContent.slice(1).toLowerCase()}
            </div>
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    dispatch(setCurrentWords({ currentLetter, allWords }));
  }, [allWords]);
  return (
    <div className="accordion-container animate__animated animate__fadeInLeft">
      <Accordion>
        {words.map((item, index) => (
          <AccordionTab
            className={`accordion-tab ${hoveredTab === index ? "hovered" : ""}`}
            key={item.letter}
            header={<div className="accordion-header">{item.letter}</div>}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleAccordionTabClick(item.letter)}
          >
            <div className="accordion-content">
              <VirtualScroller
                items={item.wordContents}
                onScroll={(e) => handleScroll(e, item.letter)}
                autoSize={true}
                itemSize={50}
                itemTemplate={itemTemplate}
                className="custom-virtual-scroller"
                style={{ height: "200px" }}
                orientation="vertical"
              />
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
}

export default AccerdionMenu;
