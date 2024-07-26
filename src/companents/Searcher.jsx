import { AutoComplete } from "primereact/autocomplete";
import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import "../styles/Searcher.css";

import wordApi from "../api/wordApi";
import _, { filter } from "lodash";

function Searcher({ isSearched, forModal, searchedWordF, searchedWordIdF, word }) {
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
    const id = words.find(w => w.wordContent === wordToFind).id;
    searchedWordIdF(id);
  }

  const debounceSearch = useCallback(
    _.debounce(async (query) => {
      const response = await wordApi.GetWordsByContains(query);
      const { body } = response;
      setWords(
        body.map((item) => ({ id: item.id, wordContent: item.wordContent }))
      );
    }, 500),
    []
  );
  
  const handleSelect = (e) => {
    searchedWordF(e.value);
    wordIdSetter(e.value);
    isSearched();
    wordIdSetter();
  }

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
          style={{ fontSize: "16px !important" }}
          completeMethod={search}
          onChange={(e) => {
            handleChange(e);
          }}
          onSelect={(e) => handleSelect(e)}
          placeholder="Kelime Arayın"
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
