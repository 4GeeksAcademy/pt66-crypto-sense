import React, { useState, useCallback } from 'react';
import '../styles/CoinSearch.css';

const CoinSearch = ({ setSelectedCoin }) => {
  const [searchCoin, setSearchCoin] = useState('');
  const [coinSuggestions, setCoinSuggestions] = useState([]);

  const fetchCoinSuggestions = async (query) => {
    if (!query) {
      setCoinSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coin_suggestions/${query}`);
      const data = await response.json();
      setCoinSuggestions(data.coins || []);
    } catch (error) {
      console.error('Error fetching coin suggestions:', error);
    }
  };

  // Debounce the fetchCoinSuggestions function
  const debouncedFetchCoinSuggestions = useCallback(debounce(fetchCoinSuggestions, 500), []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchCoin(value);
    debouncedFetchCoinSuggestions(value);
  };

  const handleSuggestionClick = (coin) => {
    setSearchCoin(coin.name);
    setCoinSuggestions([]);
    setSelectedCoin(coin.id); 
  };

  return (
    <div className="coin-search">
      <form className="search-form">
        <input
          type="text"
          value={searchCoin}
          onChange={handleInputChange}
          placeholder="Search Coin"
          className="search-input"
        />
      </form>
      {coinSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {coinSuggestions.map((coin) => (
            <li key={coin.id} onClick={() => handleSuggestionClick(coin)}>
              {coin.logo && <img src={coin.logo} alt={coin.name} className="coin-logo" />}
              {coin.name} ({coin.symbol.toUpperCase()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export default CoinSearch;