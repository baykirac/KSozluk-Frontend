import { AutoComplete } from "primereact/autocomplete";
import React, { useEffect } from "react";
import { useState } from "react";
import { classNames } from "primereact/utils";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

import "../styles/Searcher.css";

import DescriptionField from "./DescriptionField";

import { WordsService } from "../pages/WordsService";

function Searcher({ isSearched, forModal, searchedWordF, word }) {
  const [value, setValue] = useState(word);

  const [filteredItems, setfilteredItems] = useState([]);

  const [words, setWords] = useState([]);

  const search = (e) => {
    setfilteredItems(
      words.filter((item) =>
        item.toLowerCase().startsWith(e.query.toLowerCase())
      )
    );
  };

  const getWords = (data) => {
    return [...(data || [])].map((d) => {
      d.date = new Date(d.date);

      return d.word;
    });
  };

  useEffect(() => {
    WordsService.getWordsMedium().then((data) => {
      setWords(getWords(data));
    });
  }, []);

  return (
    <>
      {forModal ? (
        <AutoComplete
          className="modal-searcher"
          value={value}
          suggestions={filteredItems}
          style={{fontSize: "16px !important" }}
          completeMethod={search}
          onChange={(e) => setValue(e.value)}
          onSelect={(e) => {
            searchedWordF(e.value);
            isSearched();
          }}
          placeholder="Kelime Arayın"
        />
      ) : (
        <div className="searcher">
          <AutoComplete
            value={value}
            suggestions={filteredItems}
            completeMethod={search}
            onChange={(e) => setValue(e.value)}
            placeholder="Kelime Arayın"
            onSelect={(e) => {
              searchedWordF(e.value);
              isSearched();
            }}
          />
        </div>
      )}
    </>
  );
}

export default Searcher;
