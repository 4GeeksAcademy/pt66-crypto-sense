import React from 'react';
import './aboutUs.css';

export const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About CryptoSense</h1>
        <p className="about-description">
          At CryptoSense, we are passionate about empowering individuals and businesses
          with real-time cryptocurrency tracking and advanced analytics. Our platform is
          designed to provide users with the most accurate and up-to-date information in
          the fast-paced world of cryptocurrency.
        </p>
        <p className="about-mission">
          Our mission is to make cryptocurrency accessible and understandable for everyone,
          whether you're a seasoned trader or a curious newcomer. We believe in the power
          of data and strive to deliver insights that can help you make informed decisions
          in the crypto market.
        </p>
        <h2 className="about-subtitle">Our Team</h2>
        <p className="about-team">
          Our team consists of experienced professionals in the fields of blockchain
          technology, data science, and financial analysis. We are dedicated to providing
          a seamless user experience and constantly improving our platform to meet the
          needs of our users.
        </p>
      </div>
    </div>
  );
};
