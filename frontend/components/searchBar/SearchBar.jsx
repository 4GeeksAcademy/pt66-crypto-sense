import { useState } from "react";
import "../searchBar/searchBar";

const SearchBar = ({ coins, onSearch }) => {
  const [input, setInput] = useState("");
  const [filteredCoins, setFilteredCoins] = useState(coins);

  const inputHandler = (event) => {
    setInput(event.target.value);
    if (event.target.value.trim() === "") {
      setFilteredCoins(coins);
    } else {
      const searchResults = coins.filter((coin) =>
        coin.name.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setFilteredCoins(searchResults);
    }
  };

  const searchHandler = (event) => {
    event.preventDefault();
    onSearch(filteredCoins);
  };

  return (
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
        {filteredCoins.map((coin, index) => (
          <option key={index} value={coin.name} />
        ))}
      </datalist>
      <button>Search</button>
    </form>
  );
};

export default SearchBar;