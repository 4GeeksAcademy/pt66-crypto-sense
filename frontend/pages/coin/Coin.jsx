import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from 'chart.js';
import "../coin/coin.css";
import CoinConverter from "../../components/CoinConverter";
import NewsComponent from "../../components/NewsComponent";

// Register Chart.js modules 
ChartJS.register(...registerables);

const Coin = () => {
  const { coinId } = useParams();
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-cg-demo-api-key': 'CG-VNhC8xXZnRp353MYKp3SvrT5'
    }
  };

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options);
        const data = await response.json();
        setCoin(data);
      } catch (error) {
        console.error("Error fetching coin data:", error);
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`, options);
        const data = await response.json();
        setChartData({
          labels: data.prices.map(price => new Date(price[0]).toLocaleDateString()),
          datasets: [{
            label: 'Price (USD)',
            data: data.prices.map(price => price[1]),
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)',
          }]
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
    fetchChartData();

    return () => {
      setCoin(null);
      setChartData(null);
    };
  }, [coinId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!coin) {
    return <div>Coin not found</div>;
  }

  return (
    <div className="coinPage">
      <div className="coin">
      <h1>{coin.name}</h1>
      <img src={coin.image.large} alt={coin.name} />
      <p>Symbol: {coin.symbol}</p>
      <p>Current Price: ${coin.market_data.current_price.usd}</p>
      <p>Rank: {coin.market_cap_rank}</p>
      <p>Market Cap: ${coin.market_data.market_cap.usd.toLocaleString()}</p>
      <p>24h High: ${coin.market_data.high_24h.usd}</p>
      <p>24h Low: ${coin.market_data.low_24h.usd}</p>
      <div className="chart">
        <h2>Price Chart (Last 30 Days)</h2>
        {chartData && <Line data={chartData} />}
      </div>
      </div>
      <div className="components">
        <CoinConverter selectedCoin={coinId} />
        <NewsComponent selectedCoin={coinId} />
      </div>
    </div>
  );
};

export default Coin;
