import React, { useState, useEffect } from 'react';
import '../styles/NewsComponent.css';

const NewsComponent = ({ selectedCoin }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (selectedCoin) {
      fetchNews(selectedCoin);
      fetchCoinLogo(selectedCoin);
    }
  }, [selectedCoin]);

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
      if (data && data.articles) {
        if (loadMore) {
          setNews(prevNews => [...prevNews, ...data.articles]);
        } else {
          setNews(data.articles);
          setDisplayCount(5);
        }
        setHasMore(data.articles.length >= 5);
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

  const fetchCoinLogo = async (coin) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coin_logos/${coin}`);
      const data = await response.json();
      console.log("Fetched logo data:", data);
      if (data.logo) {
        setLogoUrl(data.logo);
      } else {
        setLogoUrl(null);
      }
    } catch (error) {
      console.error('Error fetching coin logo:', error);
    }
  };

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
    if (displayCount + 5 >= news.length) {
      fetchNews(selectedCoin, true);
    }
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

  return (
    <div className="news-component">
      <h2 className="d-flex align-items-center mb-3">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt={selectedCoin} 
            className="me-2"
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
          />
        )}
        {selectedCoin} News
      </h2>
      
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
                <p className="news-body">{item.body}</p> {/* Display the body text */}
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
          <p>No news available for {selectedCoin}</p>
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

export default NewsComponent;