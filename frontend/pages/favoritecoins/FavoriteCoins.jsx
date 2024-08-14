import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../favoritecoins/favoriteCoins.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const FavoriteCoins = () => {
  const { store, dispatch } = useGlobalReducer();
  const { favorites } = store;
  const [favoriteCoinsData, setFavoriteCoinsData] = useState([]);

  useEffect(() => {
    console.log("Favorites array:", favorites); 

    const fetchCoinData = async () => {
      try {
        const coinDataPromises = favorites.map((fav) =>
          fetch(`https://api.coingecko.com/api/v3/coins/${fav.id}`)
            .then((response) => response.json())
        );

        const coinsData = await Promise.all(coinDataPromises);
        setFavoriteCoinsData(coinsData);
      } catch (error) {
        console.error("Failed to fetch favorite coins data:", error);
      }
    };

    fetchCoinData();
  }, [favorites]);

  const handleRemoveFavorite = (coinId) => {
    dispatch({ type: "remove_favorite", coinId });
  };

  return (
    <div className="crypto-table mt-5">
      <div className="table-header">
        <p> </p>
        <p>#</p>
        <p>Coin</p>
        <p>Price</p>
        <p>24H Change</p>
        <p className="marketcap">Market Cap</p>
      </div>
      {favoriteCoinsData.length > 0 ? (
        favoriteCoinsData.map((coin, index) => (
          <div className="table-row" key={coin.id}>
            <div>
              <i
                className="fa-solid fa-star"
                onClick={() => handleRemoveFavorite(coin.id)}
              ></i>
            </div>
            <p>{coin.market_cap_rank}</p>
            <Link to={`/coin/${coin.id}`} className="coin-link">
              <img src={coin.image.small} alt={coin.name} />
              <p>{coin.name + " - " + coin.symbol.toUpperCase()}</p>
            </Link>
            <p>{"$ " + coin.market_data.current_price.usd.toLocaleString()}</p>
            <p
              style={{
                color:
                  coin.market_data.price_change_percentage_24h >= 0
                    ? "lime"
                    : "red",
              }}
            >
              {coin.market_data.price_change_percentage_24h?.toFixed(2)}%
            </p>
            <p className="marketcap">
              $ {coin.market_data.market_cap.usd.toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p>No favorite coins yet. Add some from the main list!</p>
      )}
    </div>
  );
};
