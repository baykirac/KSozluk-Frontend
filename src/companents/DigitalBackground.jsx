import { useState, useEffect } from 'react';

const DigitalBackground = () => {
  const [characters, setCharacters] = useState([]);


  const colorPalette = [
    'rgba(13, 67, 97, 0.5)',
    'rgba(17, 24, 39, 0.5)',
    'rgba(55, 48, 163, 0.5)',
    'rgba(88, 28, 135, 0.5)',
    'rgba(124, 45, 18, 0.5)',
    'rgba(21, 94, 117, 0.5)',
    'rgba(29, 78, 216, 0.5)'
  ];

  useEffect(() => {
    const generateCharacters = () => {
      const newCharacters = [];
      const characterCount = 500;

      for (let i = 0; i < characterCount; i++) {
        newCharacters.push({
          id: i,
          character: getRandomCharacter(),
          left: Math.random() * 100,
          animationDuration: Math.random() * 15 + 10,
          opacity: Math.random() * 0.7 + 0.3,
          size: Math.random() * 30 + 10,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          delay: Math.random() * -15
        });
      }

      setCharacters(newCharacters);
    };

    generateCharacters();
  }, []);

  const getRandomCharacter = () => {
    const chars = [
      ...Array.from({ length: 20 }, (_, i) => `${i % 10}`),
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      ...'abcdefghijklmnopqrstuvwxyz'.split(''),
      ...'~!@#$%^&*()_+-=[]{}|;:,.<>?'.split(''),
      ...'01'.split(''),
      ...'ABCDEF'.split(''),
      '◆', '◇', '○', '●', '⊕', '⊖', '⊗',
      ...'▲▼◀▶■□△▽◁▷'.split('')
    ];
    return chars[Math.floor(Math.random() * chars.length)];
  };

  return (
    <div className="digital-background">
      {characters.map((char) => (
        <div
          key={char.id}
          className="floating-character"
          style={{
            left: `${char.left}%`,
            animationDuration: `${char.animationDuration}s`,
            opacity: char.opacity,
            fontSize: `${char.size}px`,
            color: char.color,
            animationDelay: `${char.delay}s`
          }}
        >
          {char.character}
        </div>
      ))}
    </div>
  );
};

export default DigitalBackground;
