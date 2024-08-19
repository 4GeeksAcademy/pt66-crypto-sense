import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);

  const toggleTheme = () => {
    if (!isLandingPage) {
      setIsDarkMode(!isDarkMode);
    }
  };

  const setLandingPageMode = (isLanding) => {
    setIsLandingPage(isLanding);
    if (isLanding) {
      setIsDarkMode(true);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setLandingPageMode, isLandingPage }}>
      <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);