import React from "react";
import { useState, useEffect } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import DescriptionField from "./DescriptionField";

import "../styles/AccerdionMenu.css";

function AccerdionMenu({ isSearched, searchedWordF }) {
  const alphabet = [
    { letter: "A", words: ["Araba", "Ayva", "Ateş", "Aslan", "Anne", "Adak", "Arı", "Adana", "Ankara", "Afyon", "Aydın", "Arkadaş"] },
    { letter: "B", words: ["Balık", "Bahar", "Bulut", "Böcek"] },
    { letter: "C", words: ["Ceviz", "Ceylan", "Cam", "Ceket"] },
    { letter: "Ç", words: ["Çiçek", "Çanta", "Çocuk", "Çimen"] },
    { letter: "D", words: ["Deniz", "Dağ", "Defter", "Deve"] },
    { letter: "E", words: ["Elma", "Ev", "Ekmek", "Erik"] },
    { letter: "F", words: ["Fındık", "Fare", "Fırın", "Fırtına"] },
    { letter: "G", words: ["Güneş", "Gemi", "Gül", "Göl"] },
    { letter: "Ğ", words: ["Ğüneş", "Yoğurt", "Soğan", "Doğa"] },
    { letter: "H", words: ["Hayat", "Hilal", "Hava", "Harita"] },
    { letter: "I", words: ["Işık", "Isı", "Ilık", "Islak"] },
    { letter: "İ", words: ["İnek", "İp", "İğne", "İnci"] },
    { letter: "J", words: ["Japon", "Jaguar", "Jeton", "Jandarma"] },
    { letter: "K", words: ["Kedi", "Kuş", "Kale", "Kalem"] },
    { letter: "L", words: ["Limon", "Lale", "Lamba", "Leylek"] },
    { letter: "M", words: ["Mavi", "Mum", "Meyve", "Maymun"] },
    { letter: "N", words: ["Nar", "Nergis", "Nehir", "Nane"] },
    { letter: "O", words: ["Orman", "Oda", "Ocak", "Okyanus"] },
    { letter: "Ö", words: ["Ördek", "Öküz", "Örtü", "Ömür"] },
    { letter: "P", words: ["Papatya", "Pazar", "Pencere", "Patlıcan"] },
    { letter: "R", words: ["Rüzgar", "Renk", "Radyo", "Resim"] },
    { letter: "S", words: ["Sarı", "Su", "Saat", "Sinek"] },
    { letter: "Ş", words: ["Şeker", "Şemsiye", "Şapka", "Şeftali"] },
    { letter: "T", words: ["Tavşan", "Top", "Tren", "Taş"] },
    { letter: "U", words: ["Uçak", "Uyku", "Uğur", "Uzay"] },
    { letter: "Ü", words: ["Üzüm", "Ütü", "Ülke", "Üçgen"] },
    { letter: "V", words: ["Vazo", "Vatan", "Valiz", "Volkan"] },
    { letter: "Y", words: ["Yol", "Yıldız", "Yemek", "Yaprak"] },
    { letter: "Z", words: ["Zürafa", "Zeytin", "Zaman", "Zebra"] },
  ];

  const [hoveredTab, setHoveredTab] = useState(null);
  const [visibleWords, setVisibleWords] = useState({});

  const handleMouseEnter = (index) => {
    setHoveredTab(index);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const loadMoreWords = (letter) => {
    setVisibleWords(prev => ({
      ...prev,
      [letter]: (prev[letter] || 5) + 5
    }));
  };

  return (
    <div className="accordion-container animate__animated animate__fadeInLeft">
      <Accordion>
      {alphabet.map((item, index) => (
        <AccordionTab
          className={`accordion-tab ${hoveredTab === index ? "hovered" : ""}`}
          key={item.letter}
          header={<div className="accordion-header">{item.letter}</div>}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="accordion-content">
            <div className="accordion-words">
              {item.words.slice(0, visibleWords[item.letter] || 5).map((word, wordIndex) => (
                <div
                  key={wordIndex}
                  className="accordion-word"
                  onClick={() => {
                    isSearched();
                    searchedWordF(word);
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
            {item.words.length > (visibleWords[item.letter] || 5) && (
              <Button 
                icon="pi pi-plus" 
                className="p-button-rounded p-button-text"
                onClick={() => loadMoreWords(item.letter)}
              />
            )}
          </div>
        </AccordionTab>
      ))}
    </Accordion>
    </div>
  );
}

export default AccerdionMenu;
