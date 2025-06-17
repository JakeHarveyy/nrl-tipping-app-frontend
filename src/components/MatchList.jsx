// src/components/MatchList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MatchItem from './MatchItem';
import styles from './MatchList.module.css';

const MatchList = ({ onBetPlaced }) => {
  const [matches, setMatches] = useState([]);
  const [roundInfo, setRoundInfo] = useState(null); // To store {round_number, year, status}
  const [currentDisplayRound, setCurrentDisplayRound] = useState(null); // { number, year }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveScores, setLiveScores] = useState({});

  const loadMatches = async (roundNumber, year) => {
    console.log(`loadMatches called with: roundNumber=${roundNumber}, year=${year}`);
    setLoading(true);
    setError('');

    let url = '/matches';
    const params = {};
    if (roundNumber != null && year != null) { // Check for null explicitly for initial load
      params.round_number = roundNumber;
      params.year = year;
    }

    try {
      const response = await api.get(url, { params });
      console.log(`API Response for R${roundNumber || 'initial'}/Y${year || 'initial'}:`, response.data);

      const newMatches = response.data.matches || [];
      const newRoundInfo = response.data.round_info || null;

      setMatches(newMatches);
      setRoundInfo(newRoundInfo); // This should trigger re-render for the h2

      if (newRoundInfo) {
        console.log('Setting currentDisplayRound from newRoundInfo:', newRoundInfo);
        setCurrentDisplayRound({
            number: newRoundInfo.round_number,
            year: newRoundInfo.year
        });
      } else if (roundNumber != null && year != null) { // If specific round requested but no info
        console.warn(`No round_info for R${roundNumber}/Y${year}, but setting display to requested.`);
        setCurrentDisplayRound({ number: roundNumber, year: year });
      }
      // Handle initial load if no specific round and no round_info but matches exist (less ideal)
      else if (!roundNumber && !year && newMatches.length > 0 && !newRoundInfo) {
          const firstMatch = newMatches[0];
          setCurrentDisplayRound({number: firstMatch.round_number, year: firstMatch.year});
          // Try to fetch round info specifically for this inferred round if it was missing
          const roundStatusResponse = await api.get('/matches', { params: {round_number: firstMatch.round_number, year: firstMatch.year} });
          setRoundInfo(roundStatusResponse.data.round_info || null);
      }


    } catch (err) {
      console.error("Error in loadMatches:", err);
      setError(err.response?.data?.message || 'Could not load matches for the selected round.');
      setMatches([]);
      // Don't necessarily clear roundInfo or currentDisplayRound here on error for a specific round,
      // user might want to see what round they were trying for.
      // setRoundInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("MatchList: Initial mount, fetching default matches.");
    loadMatches(null, null); // Fetch initial active/upcoming round
  }, []); // Runs only on mount

  // --- SSE Effect ---
  useEffect(() => {
    console.log("MatchList: Setting up SSE connection.");
    const eventSource = new EventSource('http://127.0.0.1:5000/api/stream/updates');

    eventSource.onmessage = (event) => {
        // Generic message handler if no event type is specified by server
        // We rely on server sending "event: event_type"
    };

    eventSource.addEventListener('score_update', (event) => {
        try {
            const update = JSON.parse(event.data);
            console.log('SSE score_update received:', update);
            if (update.match_id && update.home_score !== undefined && update.away_score !== undefined) {
                setLiveScores(prevScores => ({
                    ...prevScores,
                    [update.match_id]: {
                        home: update.home_score,
                        away: update.away_score,
                        status: update.status // Could also update status
                    }
                }));
                // Optionally, update the main matches array if status changes
                setMatches(prevMatches => prevMatches.map(m =>
                    m.match_id === update.match_id ? { ...m, status: update.status /* any other fields from SSE */ } : m
                ));
            }
        } catch (e) {
            console.error("Error parsing SSE score_update data:", e);
        }
    });

    eventSource.addEventListener('match_finished', (event) => {
        try {
            const update = JSON.parse(event.data);
            console.log('SSE match_finished received:', update);
            if (update.match_id) {
                // Update local state to reflect match finished
                setLiveScores(prevScores => ({
                    ...prevScores,
                    [update.match_id]: {
                        home: update.home_score,
                        away: update.away_score,
                        status: 'Completed' // Or 'Finished'
                    }
                }));
                // Update the main matches array
                 setMatches(prevMatches => prevMatches.map(m =>
                    m.match_id === update.match_id
                        ? { ...m, status: 'Completed', result_home_score: update.home_score, result_away_score: update.away_score, winner: update.winner }
                        : m
                ));
                // Inform dashboard or other components to refresh bankroll/bets if needed
                if (onBetPlaced) onBetPlaced(); // Re-using this callback to trigger a general refresh
            }
        } catch (e) {
            console.error("Error parsing SSE match_finished data:", e);
        }
    });


    eventSource.onerror = (err) => {
      console.error("SSE EventSource failed:", err);
      // EventSource attempts to reconnect automatically by default.
      // You might close it explicitly if server indicates permanent closure.
    };

    // Cleanup on component unmount
    return () => {
      console.log("MatchList: Closing SSE connection.");
      eventSource.close();
    };
  }, [onBetPlaced]); // Rerun if onBetPlaced changes, though usually stable

  const handleNextRound = () => {
    if (currentDisplayRound && !loading) {
      const nextRoundNum = currentDisplayRound.number + 1;
      if (nextRoundNum <= 27) { // Example max round
        loadMatches(nextRoundNum, currentDisplayRound.year);
      }
    }
  };

  const handlePreviousRound = () => {
    if (currentDisplayRound && !loading) {
      const prevRoundNum = currentDisplayRound.number - 1;
      if (prevRoundNum >= 1) { // Example min round
        loadMatches(prevRoundNum, currentDisplayRound.year);
      }
    }
  };

  return (
    <div className={styles.matchListContainer}>
      <div className={styles.roundSelector}>
        <button onClick={handlePreviousRound} disabled={loading || !currentDisplayRound || currentDisplayRound.number <= 1}>
            Prev Round
        </button>
        <h2>
          {loading && currentDisplayRound ? `Loading Round ${currentDisplayRound.number}...` : // Show loading specific round
           roundInfo ? `Round ${roundInfo.round_number} (${roundInfo.year}) - ${roundInfo.status}` :
           currentDisplayRound ? `Round ${currentDisplayRound.number} (${currentDisplayRound.year}) - No Info` : // If roundInfo is null but we know the requested round
           'Loading Round...'} {/* Default loading */}
        </h2>
        <button onClick={handleNextRound} disabled={loading || !currentDisplayRound || currentDisplayRound.number >= 27}>
            Next Round 
        </button>
      </div>
      {/* ... rest of JSX, ensure MatchItem uses bettingAllowed correctly based on roundInfo.status */}
       {!loading && !error && matches.map((match) => (
            <MatchItem
              key={match.match_id}
              match={match}
              liveScoreData={liveScores[match.match_id]} // Pass live score data
              onBetPlaced={onBetPlaced}
              bettingAllowed={roundInfo?.status === 'Active'} // Pass based on roundInfo
            />
        ))}
    </div>
  );
};

export default MatchList;