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
  Legend
);

const BankrollChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/user/bankroll-history');
        const history = response.data?.bankroll_history || [];

        // Sort history by timestamp ascending for the chart
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (history.length === 0) {
             // Handle case with no history yet
             setChartData({
                 labels: [],
                 datasets: [{
                     label: 'Bankroll ($)',
                     data: [],
                     borderColor: 'rgb(75, 192, 192)',
                     tension: 0.1
                 }]
             });
            setLoading(false);
            return;
        }

        // Prepare data for Chart.js
        // Use timestamp for x-axis and new_balance for y-axis
        const labels = history.map(item => item.timestamp); // Use actual timestamps
        const dataPoints = history.map(item => item.new_balance);

        // Add a starting point if the first entry isn't the initial deposit
        // (or just rely on the fetched history)
        // Consider adding a point at time zero with balance zero if desired

        setChartData({
          labels: labels, // Use timestamps for labels
          datasets: [
            {
              label: 'Bankroll ($)',
              data: dataPoints,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1, // Adds slight curve to the line
              pointRadius: 3, // Show points
              pointHoverRadius: 5,
            },
            // Optionally add another dataset for 'Weekly Additions' as points?
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
  }, []); // Run once on mount

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bankroll History Over Time',
      },
      tooltip: {
           callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
       }
    },
    scales: {
      x: {
        type: 'time', // Use time scale
        time: {
            unit: 'day', // Adjust unit based on data density (day, week, month)
            tooltipFormat: 'PPpp', // Format for tooltips (requires date-fns) - e.g., Aug 21, 2023, 4:30:00 PM
             displayFormats: {
                 day: 'MMM d, yyyy' // Format for axis labels
             }
        },
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
            maxRotation: 45,
            minRotation: 45, // Rotate labels slightly if they overlap
        }
      },
      y: {
        beginAtZero: false, // Start y-axis near lowest bankroll value
        title: {
          display: true,
          text: 'Bankroll ($)',
        },
         ticks: {
            // Include a dollar sign in the ticks
            callback: function(value, index, ticks) {
                return '$' + value.toLocaleString();
            }
        }
      },
    },
  };

  if (loading) return <p>Loading chart data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  // Ensure chartData exists and has labels/datasets before rendering
  if (!chartData || !chartData.labels || !chartData.datasets) return <p>No data available for chart.</p>;

  return (
      // Set a container height for the chart
      <div style={{ height: '400px', width: '100%', marginTop: '30px', marginBottom: '30px' }}>
          <Line options={options} data={chartData} />
      </div>
  );
};

export default BankrollChart;