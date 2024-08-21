import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useTheme } from "../../components/ThemeContext";
import CoinConverter from "../../components/CoinConverter";
import NewsComponent from "../../components/NewsComponent";
import "./dashboard.css";
import Cookies from 'js-cookie';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
  const { store, dispatch } = useGlobalReducer();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!store.token) {
      navigate("/login");
    }
  }, [store.token, navigate]);

  useEffect(() => {
    if (store.favorites.length > 0) {
      setSelectedCoin(store.favorites[0]);
      fetchChartData(store.favorites[0].id);
    }
    const value = store.favorites.reduce(
      (acc, coin) => acc + coin.current_price * (coin.holdings || 1),
      0
    );
    setPortfolioValue(value);
  }, [store.favorites]);

  const fetchChartData = async (coinId) => {
    setIsLoading(true);
    setError(null);

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API_KEY,
      },
    };

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`,
        options
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      if (!data || !data.prices || data.prices.length === 0) {
        throw new Error("Invalid data received from the API");
      }

      setChartData({
        labels: data.prices.map((price) =>
          new Date(price[0]).toLocaleDateString()
        ),
        datasets: [
          {
            label: "Price (USD)",
            data: data.prices.map((price) => price[1]),
            fill: true,
            backgroundColor: function (context) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return null;
              }
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top
              );
              gradient.addColorStop(0, "rgba(0, 123, 255, 0)");
              gradient.addColorStop(1, "rgba(0, 123, 255, 0.4)");
              return gradient;
            },
            borderColor: "rgba(98, 213, 255, 0.6)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message || "An error occurred while fetching chart data");
    } finally {
      setIsLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDarkMode ? "#718096" : "#4A5568",
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDarkMode ? "#718096" : "#4A5568",
          callback: function (value, index, values) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      line: {
        cubicInterpolationMode: "monotone",
      },
    },
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    fetchChartData(coin.id);
  };

  const handleRemoveCoin = async (coinId) => {
    const token = Cookies.get('token'); // Retrieve the token from cookies
    console.log("Token retrieved from cookies:", token);
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites/${coinId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.ok) {
        dispatch({ type: "remove_favorite", coinId }); // Ensure dispatch is called properly
      } else {
        console.error("Failed to remove favorite:", response.statusText);
        alert(`Error removing favorite: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("An error occurred while removing the coin.");
    }
  };
  
  

  return (
    <div className={`dashboard ${isDarkMode ? "dark" : "light"}`}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-main">
          <div className="portfolio-chart">
            <h2>{selectedCoin?.name} Price Chart</h2>
            <div className="chart-container">
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error}</p>}
              {!isLoading && !error && chartData && (
                <Line ref={chartRef} data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="side-components">
            <div className="news-component">
              <h2>Latest News</h2>
              {selectedCoin ? (
                <NewsComponent selectedCoin={selectedCoin.id} />
              ) : (
                <div className="blur-overlay">
                  Select a coin to view latest news
                </div>
              )}
            </div>

            <div className="converter-component">
              <h2>Currency Converter</h2>
              {selectedCoin && <CoinConverter selectedCoin={selectedCoin.id} />}
            </div>
          </div>
        </div>

        <div className="assets-list">
          <h2>Your Favorited Coins</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Market Cap</th>
                <th>Volume (24h)</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {store.favorites.map((coin) => (
                <tr key={coin.id} onClick={() => handleCoinSelect(coin)}>
                  <td>
                    <img src={coin.image} alt={coin.name} />
                    <span>{coin.name}</span>
                    <span className="coin-symbol">
                      ({coin.symbol.toUpperCase()})
                    </span>
                  </td>
                  <td>${coin.current_price.toLocaleString()}</td>
                  <td
                    className={
                      coin.price_change_percentage_24h >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td>${coin.market_cap.toLocaleString()}</td>
                  <td>${coin.total_volume.toLocaleString()}</td>
                  <td>
                    <button
                      className="remove-coin-button"
                      onClick={(e) => {
                        // no row click
                        e.stopPropagation();
                        handleRemoveCoin(coin.id);
                      }}
                    >
                    <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
