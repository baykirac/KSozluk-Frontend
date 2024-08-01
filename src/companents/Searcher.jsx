import { AutoComplete } from "primereact/autocomplete";
import React, { useEffect, useCallback } from "react";
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
}) {
  const [value, setValue] = useState(word);

  const [filteredItems, setfilteredItems] = useState([]);

  const [words, setWords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const search = (e) => {
    setfilteredItems(
      words.filter((item) => item.toLowerCase().includes(e.query.toLowerCase()))
    );
  };

  const wordIdSetter = (wordToFind) => {
    const id = words.find((w) => w.wordContent === wordToFind).id;
    searchedWordIdF(id);
  };

  const debounceSearch = useCallback(
    _.debounce(async (query) => {
      const response = await wordApi.GetWordsByContains(query);
      const { body } = response;
      setWords(
        body.map((item) => ({ id: item.id, wordContent: item.wordContent.charAt(0).toUpperCase() + item.wordContent.slice(1).toLowerCase() }))
      );
    }, 500),
    []
  );

  const handleSelect = (e) => {
    searchedWordF(e.value);
    if (!forAdmin) {
      wordIdSetter(e.value);
      isSearched();
      wordIdSetter();
    }
  };

  const handleChange = (e) => {
    setWords([]);
    setValue(e.target.value);
    debounceSearch(e.target.value);
  };

  useEffect(() => {
    setSuggestions(words.map((item) => item.wordContent));
  }, [words]);

  return (
    <>
      {forModal ? (
        <AutoComplete
          className="modal-searcher"
          value={value}
          suggestions={suggestions}
          style={{ fontSize: "32px !important" }}
          completeMethod={search}
          onChange={(e) => {
            handleChange(e);
            setTheWordF(e.target.value);
          }}
          onSelect={(e) => handleSelect(e)}
          placeholder="Kelime Girin"
        />
      ) : (
        <div className="searcher">
          <AutoComplete
            value={value}
            suggestions={suggestions}
            onChange={(e) => {
              handleChange(e);
            }}
            max={10}
            placeholder="Kelime Arayın"
            onSelect={(e) => handleSelect(e)}
            completeMethod={search}
          />
        </div>
      )}
    </>
  );
}

export default Searcher;
