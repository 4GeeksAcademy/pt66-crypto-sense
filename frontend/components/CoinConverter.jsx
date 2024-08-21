import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import '../styles/CoinConverter.css'

const fiatCurrencies = [
  { code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Pound Sterling', flag: '🇬🇧' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'TWD', name: 'New Taiwan Dollar', flag: '🇹🇼' },
  { code: 'KRW', name: 'Korean Won', flag: '🇰🇷' },
];

const cryptocurrencies = [
  { code: 'BTC', name: 'Bitcoin', icon: '₿' },
  { code: 'CRO', name: 'Cronos', icon: 'C' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { code: 'SOL', name: 'Solana', icon: 'S' },
];

const CoinConverter = ({ selectedCoin, logoUrl }) => {
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [conversionRate, setConversionRate] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (selectedCoin) {
      fetchConversionRate(selectedCoin, currency);
    }
  }, [selectedCoin, currency]);

  const fetchConversionRate = async (coin, fiat) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/convert/${coin}/${fiat.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.rate) {
          setConversionRate(data.rate);
        } else {
          console.error('Error fetching conversion rate:', data.error);
          setConversionRate(null);
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      setConversionRate(null);
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleInvert = () => {
    const newSelectedCoin = currency;
    const newCurrency = selectedCoin;

    setCurrency(newSelectedCoin);
    setAmount((prevAmount) => 1 / prevAmount);
    setConversionRate((prevRate) => 1 / prevRate);
  };

  return (
    <div className={`coin-converter ${isDarkMode ? 'dark' : 'light'}`}>
      <h3 className="converter-title">Currency Converter</h3>
      <div className="converter-form">
        <div className="input-group">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="amount-input"
          />
          <div className="currency-select">
            {/* <span className="currency-icon">
              {logoUrl ? <img src={logoUrl} alt={selectedCoin} width="20" /> : (cryptocurrencies.find((c) => c.code === selectedCoin)?.icon || '₿')}
            </span> */}
            <span>{selectedCoin?.toUpperCase()}</span>
          </div>
        </div>
        <button className="invert-button" onClick={handleInvert}>⇅</button>
        <div className="input-group">
          <input
            type="text"
            value={conversionRate !== null ? (amount * conversionRate).toFixed(2) : 'N/A'}
            readOnly
            className="result-input"
          />
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="currency-select"
          >
            {[...fiatCurrencies, ...cryptocurrencies].map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag || curr.icon} {curr.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="conversion-rate">
        1 {selectedCoin?.toUpperCase()} = {conversionRate !== null ? conversionRate.toFixed(2) : 'N/A'} {currency.toUpperCase()}
      </div>
      <div className="rate-info">
        Rate is for reference only. Updated a few seconds ago.
      </div>
    </div>
  );
};

export default CoinConverter;