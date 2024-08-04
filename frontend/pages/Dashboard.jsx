import React from 'react';
import NewsComponent from '../components/NewsComponent';
import '../styles/Dashboard.css'; // We'll create this CSS file next

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Cryptocurrency Dashboard</h1>
      <div className="dashboard-content">
        <NewsComponent />
        {/* You can add other dashboard components here */}
      </div>
    </div>
  );
};

export default Dashboard;