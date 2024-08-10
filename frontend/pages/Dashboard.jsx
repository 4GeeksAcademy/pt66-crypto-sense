import React, { useState } from 'react';
import CoinSearch from '../components/CoinSearch';
import CoinConverter from '../components/CoinConverter';
import NewsComponent from '../components/NewsComponent';
import '../styles/MyDashboard.css'; 

const Dashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // Defaults to Bitcoin

  return (
    <div className="my-dashboard">
      <h1>My Cryptocurrency Dashboard</h1>
      <CoinSearch setSelectedCoin={setSelectedCoin} />
      <CoinConverter selectedCoin={selectedCoin} />
      <NewsComponent selectedCoin={selectedCoin} />
    </div>
  );
};

export default Dashboard;
