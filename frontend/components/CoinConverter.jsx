import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (selectedCoin) {
      fetchConversionRate(selectedCoin, currency);
    }
  }, [selectedCoin]);

  useEffect(() => {
    if (selectedCoin) {
      fetchConversionRate(selectedCoin, currency);
    }
  }, [currency]);

  const fetchConversionRate = async (coin, fiat) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/convert/${coin}/${fiat.toLowerCase()}`);
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.rate) {
          setConversionRate(data.rate);
        } else {
          console.error('Error fetching conversion rate:', data.error);
          setConversionRate(null);
        }
      } else {
        console.error('Error fetching conversion rate: Non-JSON response or network error');
        setConversionRate(null);
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
    <div className="card p-3">
      <form>
        <div className="form-group">
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text">
                {logoUrl ? <img src={logoUrl} alt={selectedCoin} width="20" /> : (cryptocurrencies.find((c) => c.code === selectedCoin)?.icon || '₿')}
              </span>
            </div>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
            />
          </div>
        </div>
        <button type="button" className="btn btn-outline-primary mb-3" onClick={handleInvert}>
          ⟷
        </button>
        <div className="form-group">
          <div className="input-group">
            <select
              className="form-control"
              value={currency}
              onChange={handleCurrencyChange}
            >
              <optgroup label="Fiat Currency">
                {fiatCurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code.toUpperCase()} - {curr.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cryptocurrency">
                {cryptocurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.icon} {curr.code.toUpperCase()} - {curr.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <input
              type="text"
              className="form-control"
              value={conversionRate !== null ? (amount * conversionRate).toFixed(2) : 'N/A'}
              readOnly
            />
          </div>
        </div>
        <div className="mt-3">
          1 {selectedCoin?.toUpperCase()} = {conversionRate !== null ? conversionRate : 'N/A'} {currency.toUpperCase()}
          <br />
          Rate is for reference only. Updated a few seconds ago.
        </div>
      </form>
    </div>
  );
};

export default CoinConverter;