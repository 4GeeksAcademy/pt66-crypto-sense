import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import '../styles/NewsComponent.css';

const NewsComponent = ({ selectedCoin }) => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (selectedCoin) {
      fetchNews(selectedCoin);
    }
  }, [selectedCoin]);

  const fetchNews = async (coin) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coin_news/${coin}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data.articles && data.articles.length > 0) {
        setNews(data.articles[0]);
      } else {
        setNews(null);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news. Please try again.');
    } finally {
      setLoading(false);
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

  if (loading) return <div className="news-loading">Loading latest news...</div>;
  if (error) return <div className="news-error">{error}</div>;
  if (!news) return <div className="news-empty">No recent news available.</div>;

  return (
    <div className={`news-component-inner ${isDarkMode ? 'dark' : 'light'}`}>
      <h3 className="news-title">{news.title}</h3>
      <div className="news-meta">
        <span className="news-source">{news.source_info.name}</span>
        <span className="news-time">{formatTime(news.published_on)}</span>
      </div>
      <p className="news-excerpt">{news.body.slice(0, 100)}...</p>
      <a 
        href={news.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="news-link"
      >
        Read full article
      </a>
    </div>
  );
};

export default NewsComponent;
