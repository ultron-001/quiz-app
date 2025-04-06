import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import LocalStorage from './LocalStorage';
import useNavigationControl from './hooks/useNavigationControl';

function Scoreboard({ category, categoryId, difficulty, score, highScore: initialHighScore, restartQuiz }) {
  // Use local state to track the high score
  const [highScore, setHighScore] = useState(initialHighScore);
  // Add state to track if high score was reset
  const [highScoreReset, setHighScoreReset] = useState(false);
  
  // Force a refresh of the high score from localStorage when component mounts
  useEffect(() => {
    // Get the high score directly from localStorage
    const storedHighScore = LocalStorage.getHighScore(categoryId, difficulty);
  
    console.log("Scoreboard - categoryId:", categoryId);
    console.log("Scoreboard - difficulty:", difficulty);
    console.log("Scoreboard - score:", score);
    console.log("Scoreboard - initialHighScore:", initialHighScore);
    console.log("Scoreboard - storedHighScore from localStorage:", storedHighScore);
  
    // Use the maximum value between the current score, passed prop, and localStorage
    const actualHighScore = Math.max(score, initialHighScore, storedHighScore);
    console.log("Scoreboard - actualHighScore to display:", actualHighScore);
  
    setHighScore(actualHighScore);
  
    // If this is a new high score, save it to localStorage
    if (actualHighScore > storedHighScore) {
      LocalStorage.saveHighScore(categoryId, difficulty, actualHighScore);
      console.log("Scoreboard - saved new high score to localStorage:", actualHighScore);
    }
  }, [categoryId, difficulty, initialHighScore, score]);
  
  // Control navigation - allow back button but with confirmation
  useNavigationControl({
    disableBack: true,
    alertMessage: 'Please use the Play Again button to start a new quiz.',
    redirectTo: null
  });
  
  // Determine if the current score is a new high score
  const isNewHighScore = score > 0 && score >= highScore && !highScoreReset;
  
  const resetHighScore = () => {
    // Reset the high score for this category and difficulty
    LocalStorage.resetHighScore(categoryId, difficulty);
    // Update the local state
    setHighScore(0);
    // Set the reset flag to true
    setHighScoreReset(true);
  };
  
  return (
    <div className="scoreboard">
      <h1>Results</h1>
      <h2>Category: {category}</h2>
      <h2>Difficulty: {difficulty}</h2>
      <h2>Your Final Score: {score} out of 10</h2>
      <h2>High Score: {highScore}</h2>
      
      {isNewHighScore && !highScoreReset && (
        <div className="new-high-score">
          <h3>🎉 New High Score! 🎉</h3>
        </div>
      )}
      
      {highScoreReset && (
        <div className="reset-high-score-message">
          <h3>High score has been reset</h3>
        </div>
      )}
      
      <div className="scoreboard-buttons">
        <button onClick={restartQuiz} className='scoreboard_restart_btn'>Play Again</button>
        <button onClick={resetHighScore} className="reset-button">Reset High Score</button>
      </div>
    </div>
  );
}

Scoreboard.propTypes = {
  score: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  difficulty: PropTypes.string.isRequired,
  highScore: PropTypes.number,
  restartQuiz: PropTypes.func.isRequired
};

Scoreboard.defaultProps = {
  highScore: 0
};

export default Scoreboard;
