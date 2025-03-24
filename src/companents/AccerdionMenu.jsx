import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentWords, setSelectedWordId } from "../data/wordSlice";
import wordApi from "../api/wordApi";
import "../styles/AccerdionMenu.css";

// eslint-disable-next-line react/prop-types
function AccerdionMenu({ isSearched, searchedWordF, searchedWordIdF }) {
  const dispatch = useDispatch();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [allWords, setAllWords] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadedAllWords, setLoadedAllWords] = useState(false);

  const alphabet = 'ABCÇDEFGHIİJKLMNOÖPQRSŞTUÜVWXYZ'.split('');

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
    if (response.success) {
      const { body } = response;
      const newWordContents = body.wordResults.map((wordObj) => ({
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

  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50 && !loading && !loadedAllWords) {
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

  const getWordListClass = (letter) => {
    if (!allWords[letter] || allWords[letter].length === 0) {
      return 'word-list empty';
    }
    return `word-list ${allWords[letter]?.length > 5 ? 'scrollable' : ''}`;
  };

  return (
    <div className="sidebar">
      <div className="alphabet-column">
        {alphabet && alphabet.map((letter) => (
          <div key={letter}>
            <div
              className={`letter ${selectedLetter === letter ? 'selected' : ''}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </div>
            {selectedLetter === letter && (
              <div 
                className={getWordListClass(letter)}
                onScroll={handleScroll}
              >
                {allWords[letter]?.map((word) => (
                  <div
                    key={word.id}
                    className="word-item"
                    onClick={() => handleWordClick(word)}
                  >
                    {word.wordContent}
                  </div>
                ))}
                {loading && <div className="loading">Loading...</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccerdionMenu;