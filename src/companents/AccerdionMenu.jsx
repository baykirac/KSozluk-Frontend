import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCurrentWords, setSelectedWordId } from "../data/wordSlice";
import wordApi from "../api/wordApi";
import "../styles/AccerdionMenu.css";
import { VirtualScroller } from "primereact/virtualscroller";

function AccerdionMenu({ isSearched, searchedWordF, searchedWordIdF }) {
  const dispatch = useDispatch();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [allWords, setAllWords] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadedAllWords, setLoadedAllWords] = useState(false);

  const alphabet = 'ABCÇDEFGHIİJKLMNOÖPQRSŞTUÜVYZ'.split('');

  const handleLetterClick = async (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(letter);
      setPageNumber(1);
      setLoadedAllWords(false);
      await loadWords(letter, 1);
    }
  };

  const loadWords = async (letter, page) => {
    setLoading(true);
    const response = await wordApi.GetWordsByLetter(letter, page, 5);
    if (response.isSuccess) {
      const { body } = response;
      const newWordContents = body.map((wordObj) => ({
        id: wordObj.id,
        wordContent: wordObj.wordContent,
      }));
      setAllWords(prev => ({
        ...prev,
        [letter]: page === 1 ? newWordContents : [...(prev[letter] || []), ...newWordContents]
      }));
      setLoading(false);
      if (newWordContents.length < 5) {
        setLoadedAllWords(true);
      }
    }
  };

  const handleLoadMore = async () => {
    if (!loadedAllWords && selectedLetter) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      await loadWords(selectedLetter, nextPage);
    }
  };

  const handleWordClick = (word) => {
    isSearched();
    searchedWordF(word.wordContent);
    searchedWordIdF(word.id);
    dispatch(setSelectedWordId(word.id));
  };

  useEffect(() => {
    if (selectedLetter && allWords[selectedLetter]) {
      dispatch(setCurrentWords({ currentLetter: selectedLetter, allWords: allWords[selectedLetter] }));
    }
  }, [selectedLetter, allWords, dispatch]);

  const itemTemplate = (word, options) => {
    return (
      <div
        className="word-item"
        onClick={() => handleWordClick(word)}
      >
        {word.wordContent}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="alphabet-column">
        {alphabet.map((letter) => (
          <div key={letter}>
            <div
              className={`letter ${selectedLetter === letter ? 'selected' : ''}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </div>
            {selectedLetter === letter && (
              <div className="word-list">
                <VirtualScroller
                  items={allWords[selectedLetter] || []}
                  itemSize={40}
                  itemTemplate={itemTemplate}
                  onLazyLoad={handleLoadMore}
                  lazy
                  //loading={loading}
                 // showLoader
                  delay={250}
                  //style={{ height: '200px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccerdionMenu;