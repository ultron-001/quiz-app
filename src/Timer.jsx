import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Timer({ duration, onTimeUp, isPaused }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    // Don't run the timer if it's paused
    if (isPaused) {
      return;
    }

    // If time is up, call the callback
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    
    // Set up the timer
    const timer = setTimeout(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp, isPaused]);

  // Calculate percentage for progress bar
  const progressPercentage = (timeLeft / duration) * 100;

  return (
    <div className="timer">
      {/* Progress Bar */}
      <div className="timer-progress-container">
        <div 
          className="timer-progress-bar" 
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: progressPercentage < 30 ? '#ff4d4d' : '#4caf50'
          }}
        ></div>
      </div>

      {/* Timer Text (Optional, can be removed if you only want the progress bar) */}
      <div className="timer-text">
        Time Left: {timeLeft}s
      </div>
    </div>
  );
}

Timer.propTypes = {
  duration: PropTypes.number.isRequired,
  onTimeUp: PropTypes.func.isRequired,
  isPaused: PropTypes.bool
};

Timer.defaultProps = {
  isPaused: false
};

export default Timer;
