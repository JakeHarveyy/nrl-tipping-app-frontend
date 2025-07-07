// src/components/BankrollChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../services/api'; // Your Axios instance
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for time-based x-axis
  Filler, // For area chart
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler for area chart
);

const BankrollChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // 'all', '30d', '7d'
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalStaked: 0,
    winRate: 0,
    bestDay: 0,
    worstDay: 0,
    startingBalance: 0,
    currentBalance: 0
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/user/bankroll-history');
        const history = response.data?.bankroll_history || [];

        // Sort history by timestamp ascending for the chart
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Calculate stats
        const calculateStats = (data) => {
          if (data.length === 0) return stats;
          
          const first = data[0];
          const last = data[data.length - 1];
          const startingBalance = first.new_balance - (first.change || 0);
          const currentBalance = last.new_balance;
          const totalProfit = currentBalance - startingBalance;
          
          let totalStaked = 0;
          let wins = 0;
          let totalBets = 0;
          let bestDay = 0;
          let worstDay = 0;
          
          data.forEach(entry => {
            if (entry.change) {
              if (entry.change > 0) wins++;
              if (entry.change < 0) totalStaked += Math.abs(entry.change);
              totalBets++;
              bestDay = Math.max(bestDay, entry.change);
              worstDay = Math.min(worstDay, entry.change);
            }
          });
          
          return {
            totalProfit,
            totalStaked,
            winRate: totalBets > 0 ? (wins / totalBets * 100) : 0,
            bestDay,
            worstDay,
            startingBalance,
            currentBalance
          };
        };

        // Filter data based on time range
        const filterDataByTimeRange = (data, range) => {
          if (range === 'all') return data;
          
          const now = new Date();
          const days = range === '30d' ? 30 : 7;
          const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          
          return data.filter(item => new Date(item.timestamp) >= cutoff);
        };

        const filteredHistory = filterDataByTimeRange(history, timeRange);
        setStats(calculateStats(history)); // Always calculate stats from full history

        if (filteredHistory.length === 0) {
             // Handle case with no history yet
             setChartData({
                 labels: [],
                 datasets: [{
                     label: 'Bankroll ($)',
                     data: [],
                     borderColor: 'rgb(34, 197, 94)',
                     backgroundColor: 'rgba(34, 197, 94, 0.1)',
                     fill: true,
                     tension: 0.2
                 }]
             });
            setLoading(false);
            return;
        }

        // Add starting point if we have data
        let chartHistory = [...filteredHistory];
        if (chartHistory.length > 0) {
          const firstEntry = chartHistory[0];
          const startingBalance = firstEntry.new_balance - (firstEntry.change || 0);
          
          // Add a starting point 
          chartHistory.unshift({
            timestamp: new Date(new Date(firstEntry.timestamp).getTime() - 60000).toISOString(),
            new_balance: startingBalance,
            change: 0,
            description: 'Starting Balance'
          });
        }

        // Prepare data for Chart.js
        const labels = chartHistory.map(item => item.timestamp);
        const dataPoints = chartHistory.map(item => item.new_balance);
        
        // Create gradient for positive/negative changes
        const isPositive = chartHistory[chartHistory.length - 1]?.new_balance >= chartHistory[0]?.new_balance;
        const borderColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
        const backgroundColor = isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Bankroll',
              data: dataPoints,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              fill: true,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 8,
              pointBackgroundColor: borderColor,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: borderColor,
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
            }
          ],
        });

      } catch (err) {
        console.error("Error fetching bankroll history:", err);
        setError('Could not load bankroll history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [timeRange]); // Re-fetch when time range changes

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false, // We'll use a custom title outside the chart
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(context) {
            const date = new Date(context[0].label);
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          },
          label: function(context) {
            const value = context.parsed.y;
            return `Bankroll: ${new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(value)}`;
          },
          afterLabel: function(context) {
            // Show change from previous point if available
            const currentIndex = context.dataIndex;
            if (currentIndex > 0) {
              const currentValue = context.parsed.y;
              const previousValue = context.chart.data.datasets[0].data[currentIndex - 1];
              const change = currentValue - previousValue;
              const changeText = change >= 0 ? '+' : '';
              return `Change: ${changeText}${new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(change)}`;
            }
            return null;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeRange === '7d' ? 'day' : timeRange === '30d' ? 'day' : 'week',
          tooltipFormat: 'PPpp',
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal'
          }
        },
        ticks: {
          maxRotation: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Bankroll ($)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal'
          }
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
    },
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeColor = (value) => {
    if (value > 0) return '#22c55e'; // green
    if (value < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      fontSize: '16px',
      color: '#6b7280'
    }}>
      <div>📊 Loading your bankroll history...</div>
    </div>
  );
  
  if (error) return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#fef2f2', 
      border: '1px solid #fecaca',
      borderRadius: '8px',
      color: '#dc2626',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️ Error</div>
      <div>{error}</div>
    </div>
  );

  if (!chartData || !chartData.labels || !chartData.datasets) return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f9fafb', 
      border: '2px dashed #d1d5db',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#6b7280'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
      <div style={{ fontSize: '18px', marginBottom: '8px' }}>No Bankroll History Yet</div>
      <div>Your bankroll chart will appear here once you start placing bets!</div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '24px',
      marginTop: '30px', 
      marginBottom: '30px'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📊</span>
            Bankroll Performance
          </h2>
          
          {/* Time Range Selector */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px'
          }}>
            {['7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: timeRange === range ? '#3b82f6' : 'transparent',
                  color: timeRange === range ? '#ffffff' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Current Balance */}
          <div style={{ 
            backgroundColor: '#f0f9ff',
            border: '1px solid #e0f2fe',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>
              Current Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>
              {formatCurrency(stats.currentBalance)}
            </div>
          </div>

          {/* Total Profit/Loss */}
          <div style={{ 
            backgroundColor: stats.totalProfit >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${stats.totalProfit >= 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: stats.totalProfit >= 0 ? '#15803d' : '#dc2626', 
              marginBottom: '4px' 
            }}>
              Total P&L
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: stats.totalProfit >= 0 ? '#166534' : '#dc2626' 
            }}>
              {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
            </div>
          </div>

          {/* Win Rate */}
          <div style={{ 
            backgroundColor: '#fefbf3',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#c2410c', marginBottom: '4px' }}>
              Win Rate
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#9a3412' }}>
              {formatPercentage(stats.winRate)}
            </div>
          </div>

          {/* Best/Worst Day */}
          <div style={{ 
            backgroundColor: '#fafafa',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#525252', marginBottom: '4px' }}>
              Best Day
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: getChangeColor(stats.bestDay) 
            }}>
              +{formatCurrency(stats.bestDay)}
            </div>
            <div style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>
              Worst: {formatCurrency(stats.worstDay)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ 
        height: '400px', 
        width: '100%',
        position: 'relative',
        backgroundColor: '#fdfdfd',
        borderRadius: '12px',
        border: '1px solid #f3f4f6'
      }}>
        <Line options={options} data={chartData} />
      </div>

      {/* Footer Info */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        💡 Tip: Hover over any point on the chart to see detailed information about that day's performance
      </div>
    </div>
  );
};

export default BankrollChart;