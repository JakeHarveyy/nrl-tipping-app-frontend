// src/components/MatchList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MatchItem from './MatchItem';
import AIPredictionDisplay from './AIPredictionDisplay'; 
import styles from './MatchList.module.css';
import api, { API_BASE_URL } from '../services/api'; 

const MatchList = ({ onBetPlaced }) => {
  const [matches, setMatches] = useState([]);
  const [roundInfo, setRoundInfo] = useState(null); 
  const [currentDisplayRound, setCurrentDisplayRound] = useState(null); 
  const [aiPredictions, setAIPredictions] = useState({});
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
    loadMatches(currentDisplayRound?.number, currentDisplayRound?.year); // Fetch initial active/upcoming round
  }, [currentDisplayRound?.number, currentDisplayRound?.year]); // Runs only on mount

  // --- SSE Effect ---
  useEffect(() => {
    console.log("MatchList: Setting up SSE connection.");
    const eventSource = new EventSource('${API_BASE_URL}/api/stream/updates');

    eventSource.onopen = (event) => {
    console.log("SSE Connection opened:", event);
    };

    eventSource.onmessage = (event) => {
      console.log('SSE RAW MESSAGE RECEIVED:', event); // Log the whole event object
      console.log('SSE Raw data:', event.data);
      console.log('SSE Raw event type (if any):', event.type); // 'message' for untyped, or custom type
      console.log('SSE event.lastEventId:', event.lastEventId);
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

    eventSource.addEventListener('odds_update', (event) => {
        console.log('SSE NAMED EVENT "odds_update" RECEIVED:', event.data);
        try {
            const update = JSON.parse(event.data);
            console.log('SSE odds_update received:', update);
            if (update.match_id) {
                setMatches(prevMatches => {
                    const updatedMatches = prevMatches.map(m =>
                        m.match_id === update.match_id
                            ? {
                                ...m,
                                home_odds: update.home_odds,
                                away_odds: update.away_odds,
                                last_odds_update: new Date().toISOString() // Optional: track client-side
                              }
                            : m
                    );
                    console.log('MatchList: New matches state after odds update:', updatedMatches);
                    return updatedMatches;
                });
            }
        } catch (e) {
            console.error("Error parsing SSE odds_update data:", e);
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

  const fetchMatchesAndPredictions = useCallback(async (roundNumber, year) => {
    setLoading(true);
    setError('');
    // Reset predictions for the new round
    setAIPredictions({});

    let url = '/matches';
    const params = {};
    if (roundNumber && year) {
        params.round_number = roundNumber;
        params.year = year;
    }

    try {
        const matchResponse = await api.get(url, { params });
        const newMatches = matchResponse.data.matches || [];
        const newRoundInfo = matchResponse.data.round_info || null;

        setMatches(newMatches);
        setRoundInfo(newRoundInfo);
        // ... set current display round logic ...

        // If we found a valid round, fetch its AI predictions
        if (newRoundInfo && newRoundInfo.round_number && newRoundInfo.year) {
            try {
                const predictionResponse = await api.get(`/ai-predictions/year/${newRoundInfo.year}/round/${newRoundInfo.round_number}`);
                setAIPredictions(predictionResponse.data.predictions || {});
                console.log("Fetched AI Predictions:", predictionResponse.data.predictions);
            } catch (predErr) {
                console.error("Could not fetch AI predictions for round:", predErr);
                // Don't show an error for this, just proceed without predictions
            }
        }
    } catch (matchErr) {
        console.error("Error fetching matches:", matchErr);
        setError(matchErr.response?.data?.message || 'Could not load matches.');
        setMatches([]);
        setRoundInfo(null);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch, pass null to let backend decide the round
    fetchMatchesAndPredictions(null, null);
  }, [fetchMatchesAndPredictions]);

  return (
    <div className={styles.matchListContainer}>
      <div className={styles.roundSelector}>
        <h2>
          {roundInfo ? (
            <>
              Round {roundInfo.round_number} ({roundInfo.year})
              {/* Conditionally style the status */}
              <span className={roundInfo.status === 'Active' ? styles.activeStatus : styles.otherStatus}>
                {' '} - {roundInfo.status}
              </span>
            </>
          ) : (
            'Upcoming Matches'
          )}
        </h2>

        <div className={styles.buttonContainer}>
          <button
            onClick={handlePreviousRound}
            disabled={loading || !currentDisplayRound || currentDisplayRound.number <= 1}
            className="btn btn-primary" // Use your primary blue button style
          >
            Prev
          </button>
          <button
            onClick={handleNextRound}
            disabled={loading || !currentDisplayRound || currentDisplayRound.number >= 27}
            className="btn btn-primary" // Use your primary blue button style
          >
            Next 
          </button>
        </div>
      </div>
      {/* ... rest of JSX, ensure MatchItem uses bettingAllowed correctly based on roundInfo.status */}
       {!loading && !error && matches.map((match) => (
          <div key={match.match_id} className={styles.matchContainerWithPrediction}>
            <MatchItem
              key={match.match_id}
              match={match}
              liveScoreData={liveScores[match.match_id]} // Pass live score data
              onBetPlaced={onBetPlaced}
              bettingAllowed={roundInfo?.status === 'Active'} // Pass based on roundInfo
            />
            <AIPredictionDisplay prediction={aiPredictions[match.match_id]} />
          </div>
        ))}
    </div>
  );
};

export default MatchList;