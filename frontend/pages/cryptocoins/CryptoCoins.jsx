import "../cryptocoins/cryptocoins.css";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../../components/searchBar/SearchBar";

const CryptoCoins = () => {
  const { store, dispatch } = useGlobalReducer();
  const [input, setInput] = useState("");
  const [filteredCoins, setFilteredCoins] = useState([]);

  const inputHandler = (event) => {
    setInput(event.target.value);
  };

  const searchHandler = (event) => {
    event.preventDefault();
    if (input.trim() === "") {
      setFilteredCoins(store.coins);
    } else {
      const searchResults = store.coins.filter((coin) =>
        coin.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCoins(searchResults);
    }
  };

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
            type: "load_coins",
            coins: coinsBody,
          });
          setFilteredCoins(coinsBody); // Set the initial filtered coins
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
        <form onSubmit={searchHandler}>
          <input
            onChange={inputHandler}
            list="coinlist"
            type="text"
            value={input}
            placeholder="Search for crypto..."
            required
          />
          <datalist id="coinlist">
          {filteredCoins.map((coin, index) => ( <option key={index} value={coin.name} />))}
          </datalist>
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
        {filteredCoins &&
          filteredCoins.slice(0, 10).map((coin, index) => (
            <Link to={`/coin/${coin.id}`} className="table-layout" key={index}>
              <p>{coin.market_cap_rank}</p>
              <div>
                <img src={coin.image} alt="" />
                <p>{coin.name + " - " + coin.symbol}</p>
              </div>
              <p>{"$ " + coin.current_price.toLocaleString()}</p>
              <p
                style={{
                  color: coin.price_change_percentage_24h >= 0 ? "lime" : "red",
                }}
              >
                {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
              <p className="marketcap">$ {coin.market_cap.toLocaleString()}</p>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default CryptoCoins;
