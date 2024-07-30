import "../cryptocoins/cryptocoins.css";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";

const CryptoCoins = () => {
  const { store, dispatch } = useGlobalReducer();
  
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-VNhC8xXZnRp353MYKp3SvrT5",
    },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const coinsResp = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
          options
        );

        if (coinsResp.ok) {
          const coinsBody = await coinsResp.json();
          dispatch({
            type: 'load_coins',
            coins: coinsBody,
          });
        } else {
          throw new Error(coinsResp.statusText || "Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, [dispatch]);

 

  return (
    <div className="CryptoCoins">
      <div className="hero">
        <h1>
          All your Cryptos at... <br /> Crypto Sense
        </h1>
        <p>Find any Crypto that you would like to find more info about!</p>
        <form>
          <input type="text" placeholder="Search for crypto..." />
          <button>Search</button>
        </form>
      </div>
      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coin</p>
          <p>Price</p>
          <p style={{ alignItems: "center" }}>24H Change</p>
          <p className="marketcap">Market Cap</p>
        </div>
        {store.coins && store.coins.slice(0,10).map((coin, index) => (
          <div className="table-layout" key={index}>
            <p>{coin.market_cap_rank}</p>
            <div>
              <img src={coin.image} alt="" />
              <p>{coin.name +" - "+ coin.symbol}</p>
            </div>
            <p>{"$ " + coin.current_price.toLocaleString()}</p>
            <p style={{ color: coin.price_change_percentage_24h >= 0 ? 'lime' : 'red' }}>{coin.price_change_percentage_24h.toFixed(2)}%</p>
            <p className="marketcap">$ {coin.market_cap.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoCoins;
