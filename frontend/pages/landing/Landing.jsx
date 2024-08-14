import React, { useEffect, useRef } from 'react';
import '../landing/landing.css';
import { useTheme } from '../../components/ThemeContext';

import BinanceAsset from './icons/binance-coin.svg'
import BTCAsset from './icons/bitcoin-coin.svg'
import CoinbaseAsset from './icons/coinbase-coin.svg'
import EthereumAsset from './icons/ethereum-coin.svg'
import MaticAsset from './icons/matic-coin.svg'
import RippleAsset from './icons/ripple-coin.svg'
import SolanaAsset from './icons/solana-coin.svg'
import TetherAsset from './icons/tether-coin.svg'
import UniswapAsset from './icons/uniswap-coin.svg'
import USDCAsset from './icons/usdc-coin.svg'

const Landing = () => {
  const { setLandingPageMode } = useTheme();
  const coinsContainerRef = useRef(null);
  const dashboardContainerRef = useRef(null);
  const leftIconRefs = useRef([]);
  const rightIconRefs = useRef([]);

  const leftColumnIcons = [
    { Icon: EthereumAsset, left: '25%', top: '5%' },
    { Icon: BTCAsset, left: '15%', top: '30%' },
    { Icon: SolanaAsset, left: '27%', top: '50%' },
    { Icon: TetherAsset, left: '16%', top: '70%' },
    { Icon: USDCAsset, left: '30%', top: '95%' },
  ];

  const rightColumnIcons = [
    { Icon: BinanceAsset, right: '25%', top: '5%' },
    { Icon: MaticAsset, right: '15%', top: '30%' },
    { Icon: RippleAsset, right: '27%', top: '50%' },
    { Icon: UniswapAsset, right: '16%', top: '70%' },
    { Icon: CoinbaseAsset, right: '30%', top: '95%' },
  ];

  useEffect(() => {
    setLandingPageMode(true);
    return () => setLandingPageMode(false);
  }, [setLandingPageMode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const containerRect = coinsContainerRef.current.getBoundingClientRect();

      const animateIcons = (iconRefs) => {
        iconRefs.current.forEach((iconRef, index) => {
          if (iconRef) {
            const progress = Math.min(scrollPosition / (containerRect.height / 2), 1);
            const yOffset = progress * 100;
            const rotation = progress * 360;
            
            iconRef.style.transform = `translateY(${yOffset}px) rotate(${rotation}deg)`;
            iconRef.style.opacity = 1 - progress;
          }
        });
      };

      animateIcons(leftIconRefs);
      animateIcons(rightIconRefs);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderIcons = (iconsArray, iconRefs) => (
    iconsArray.map(({ Icon, left, right, top }, index) => (
      <div 
        key={index}
        className="crypto-icon"
        ref={el => iconRefs.current[index] = el}
        style={{
          position: 'absolute',
          top,
          left,
          right,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
      >
        <img src={Icon} alt={`Crypto icon ${index + 1}`} width="45" height="45" />
      </div>
    ))
  );

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">Logo</div>
        <div className="nav-buttons">
          <button className="sign-in">Sign In</button>
          <button className="try-free">Try for Free</button>
        </div>
      </nav>

      <main className="hero-section">
        <h1 className="promo-text">
          Crypto taxes <br /> done right
        </h1>
        <p className="sub-text">
          Connect your crypto wallets and exchanges<br />
          to get your optimized tax report in minutes.
        </p>
        <button className="cta-button">Get started for free</button>

        <div className="coins-container" ref={coinsContainerRef}>
          {renderIcons(leftColumnIcons, leftIconRefs)}
          {renderIcons(rightColumnIcons, rightIconRefs)}
        </div>
      </main>

      <div className="dashboard-container" ref={dashboardContainerRef}>
        <img
          className="dashboard-hero-image"
          //src={getDashboardImage('dark', true).desktop}
          alt="dashboard"
        />
      </div>
    </div>
  );
};

export default Landing;