import React, { useState, useEffect } from 'react';
import '../styles/NewsComponent.css';

const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCoin, setSearchCoin] = useState('');
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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

  const fetchNews = async (coin, loadMore = false) => {
    console.log(`Fetching news for ${coin}`);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coin_news/${coin}`);
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = JSON.parse(responseText);
      if (data && data.Data) {
        if (loadMore) {
          setNews(prevNews => [...prevNews, ...data.Data]);
        } else {
          setNews(data.Data);
          setDisplayCount(5);
        }
        setHasMore(data.Data.length >= 5);
      } else {
        setNews([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchCoin(value);
    fetchCoinSuggestions(value);
  };

  const handleSuggestionClick = (coin) => {
    setSearchCoin(coin.name);
    setCoinSuggestions([]);
    fetchNews(coin.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchNews(searchCoin);
  };

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
    if (displayCount + 5 >= news.length) {
      fetchNews(searchCoin, true);
    }
  };

  return (
    <div className="news-component">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={searchCoin}
          onChange={handleInputChange}
          placeholder="Search Coin"
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
        {coinSuggestions.length > 0 && (
          <ul className="suggestions-list">
            {coinSuggestions.map((coin) => (
              <li key={coin.id} onClick={() => handleSuggestionClick(coin)}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </li>
            ))}
          </ul>
        )}
      </form>

      <h2>{searchCoin} News</h2>
      
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="news-list">
        {news.length > 0 ? (
          news.slice(0, displayCount).map((item) => (
            <div key={item.id} className="news-item">
              <img 
                src={item.imageurl} 
                alt={item.source_info.name} 
                className="news-thumbnail"
                onError={(e) => {e.target.src = item.source_info.img}}
              />
              <div className="news-content">
                <h3 className="news-title">{item.title}</h3>
                <p className="news-source">{item.source_info.name}</p>
                <p className="news-time">{formatTime(item.published_on)}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="full-article-link"
                >
                  FULL ARTICLE
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No news available for {searchCoin}</p>
        )}
      </div>
      {hasMore && news.length > 0 && (
        <button className="see-more-btn" onClick={handleSeeMore}>
          See more
        </button>
      )}
    </div>
  );
};
const formatTime = (timestamp) => {
  const now = new Date();
  const newsDate = new Date(timestamp * 1000);
  const diffMinutes = Math.floor((now - newsDate) / 60000);

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return newsDate.toLocaleDateString();
  }
};

export default NewsComponent;
