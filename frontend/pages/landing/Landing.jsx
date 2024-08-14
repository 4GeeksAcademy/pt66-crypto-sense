import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../landing/landing.css";
import "../../index.css";
import { useTheme } from "../../components/ThemeContext";

import BinanceAsset from "./icons/binance-coin.svg";
import BTCAsset from "./icons/bitcoin-coin.svg";
import CoinbaseAsset from "./icons/coinbase-coin.svg";
import EthereumAsset from "./icons/ethereum-coin.svg";
import MaticAsset from "./icons/matic-coin.svg";
import RippleAsset from "./icons/ripple-coin.svg";
import SolanaAsset from "./icons/solana-coin.svg";
import TetherAsset from "./icons/tether-coin.svg";
import UniswapAsset from "./icons/uniswap-coin.svg";
import USDCAsset from "./icons/usdc-coin.svg";

const Landing = () => {
  const { setLandingPageMode } = useTheme();
  const coinsContainerRef = useRef(null);
  const dashboardContainerRef = useRef(null);
  const leftIconRefs = useRef([]);
  const rightIconRefs = useRef([]);

  const testimonials = [
    {
      name: "Alex Crypto",
      handle: "@alexcrypto",
      content:
        "This real-time crypto tracking app is a game-changer! I've never felt more in control of my portfolio. #CryptoMastery",
      avatar: "frontend/assets/img/ava1.png",
    },
    {
      name: "Sarah Blockchain",
      handle: "@sarahonchain",
      content:
        "The analytics on this platform are next level. It's like having a crypto expert in my pocket 24/7. Highly recommend!",
      avatar: "frontend/assets/img/ava3.png",
    },
    {
      name: "Mike Hodl",
      handle: "@mikehodl",
      content:
        "I've tried many tracking apps, but this one takes the cake. The real-time updates have saved me more than once. #CryptoWin",
      avatar: "frontend/assets/img/ava2.png",
    },
  ];

  const leftColumnIcons = [
    { Icon: EthereumAsset, left: "25%", top: "5%" },
    { Icon: BTCAsset, left: "15%", top: "30%" },
    { Icon: SolanaAsset, left: "27%", top: "50%" },
    { Icon: TetherAsset, left: "16%", top: "70%" },
    { Icon: USDCAsset, left: "30%", top: "95%" },
  ];

  const rightColumnIcons = [
    { Icon: BinanceAsset, right: "25%", top: "5%" },
    { Icon: MaticAsset, right: "15%", top: "30%" },
    { Icon: RippleAsset, right: "27%", top: "50%" },
    { Icon: UniswapAsset, right: "16%", top: "70%" },
    { Icon: CoinbaseAsset, right: "30%", top: "95%" },
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
            const progress = Math.min(
              scrollPosition / (containerRect.height / 2),
              1
            );
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderIcons = (iconsArray, iconRefs) =>
    iconsArray.map(({ Icon, left, right, top }, index) => (
      <div
        key={index}
        className="crypto-icon"
        ref={(el) => (iconRefs.current[index] = el)}
        style={{
          position: "absolute",
          top,
          left,
          right,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <img
          src={Icon}
          alt={`Crypto icon ${index + 1}`}
          width="45"
          height="45"
        />
      </div>
    ));

  return (
    <div className="landing-page">
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="promo-text kanit kanit-bold">
            Real-Time Crypto <br /> Tracking Mastered
          </h1>
          <p className="sub-text kanit kanit-light">
            Stay ahead of the market with live updates, advanced analytics,{" "}
            <br />
            and personalized insights for your crypto portfolio.
          </p>
          <Link to="/register">
            <button className="cta-button">Start Tracking Now</button>
          </Link>
        </div>

        <div className="coins-container" ref={coinsContainerRef}>
          {renderIcons(leftColumnIcons, leftIconRefs)}
          {renderIcons(rightColumnIcons, rightIconRefs)}
        </div>
      </main>

      <div className="dashboard-container" ref={dashboardContainerRef}>
        <h2 className="dashboard-title kanit kanit-semibold">
          Immersive Crypto Tracking Experience
        </h2>
        <p className="dashboard-subtitle">
          Dive into a world of real-time data, interactive charts, and
          comprehensive market analysis.
        </p>
        <img
          className="dashboard-hero-image"
          src="frontend/assets/img/dashboard.png"
          alt="dashboard"
        />
      </div>
      <section className="testimonials-section">
        <h2 className="testimonials-title kanit kanit-semibold">
          What Our Users Say
        </h2>
        <div className="testimonials-container">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="testimonial-avatar"
                />
                <div className="testimonial-user">
                  <h3 className="testimonial-name">{testimonial.name}</h3>
                  <p className="testimonial-handle">{testimonial.handle}</p>
                </div>
              </div>
              <p className="testimonial-content">{testimonial.content}</p>
              <div className="testimonial-footer">
                <span className="testimonial-platform">Posted on X</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
