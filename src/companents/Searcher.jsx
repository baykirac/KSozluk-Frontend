import { AutoComplete } from "primereact/autocomplete";
import { useEffect, useCallback } from "react";
import { useState } from "react";
import "../styles/Searcher.css";
import wordApi from "../api/wordApi";
import _, { filter } from "lodash";

function Searcher({
  isSearched,
  forModal,
  searchedWordF,
  searchedWordIdF,
  word,
  setTheWordF,
  forAdmin,
  isDisabled,
}) {
  const [value, setValue] = useState(word);
  const [filteredItems, setfilteredItems] = useState([]);
  const [words, setWords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const search = (e) => {
    if (!e.query.trim()) return; 
    
    setfilteredItems(
      words.filter((item) => item.toLowerCase().includes(e.query.toLowerCase()))
    );
  };

  const wordIdSetter = (wordToFind) => {
    const id = words.find((w) => w.wordContent === wordToFind)?.id;
    if (id) searchedWordIdF(id);
  };

  const debounceSearch = useCallback(
    _.debounce(async (query) => {
      if (query?.trim()) {
        try {
          const response = await wordApi.GetWordsByContains(query);
          const { body } = response;
          setWords(
            body.map((item) => ({
              id: item.id,
              wordContent:
                item.wordContent.charAt(0).toUpperCase() +
                item.wordContent.slice(1).toLowerCase(),
            }))
          );
        } catch (error) {
          console.error("Arama sırasında hata:", error);
        }
      }
    }, 500),
    []
  );

  const handleSelect = (e) => {
    searchedWordF(e.value);
    if (!forAdmin) {
      wordIdSetter(e.value);
      isSearched();
    }
  };

  const handleChange = (e) => {
    setWords([]);
    setValue(e.target.value);
    if (e.target.value?.trim()) {
      debounceSearch(e.target.value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === " " && !value?.trim()) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    setSuggestions(words.map((item) => item.wordContent));
  }, [words]);

  const autoCompleteProps = {
    value,
    suggestions,
    completeMethod: search,
    onChange: (e) => {
      handleChange(e);
      if (forModal) setTheWordF(e.target.value);
    },
    onSelect: handleSelect,
    onKeyDown: handleKeyDown,
    disabled: isDisabled,
  };

  if (forModal) {
    return (
      <AutoComplete
        {...autoCompleteProps}
        className="modal-searcher"
        style={{ fontSize: "32px !important" }}
        placeholder="Kelime Girin"
      />
    );
  }

  return (
    <div className="searcher">
      <AutoComplete
        {...autoCompleteProps}
        max={10}
        placeholder="Kelime Girin"
      />
    </div>
  );
}

export default Searcher;