import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    // Custom back navigation logic
    if (location.pathname === '/categories') {
      // If on categories page, go to home
      navigate('/');
    } else if (location.pathname.startsWith('/quiz/')) {
      // If in quiz, confirm before going back
      if (window.confirm('Are you sure you want to leave the quiz?')) {
        navigate('/categories');
      }
    } else if (location.pathname.startsWith('/scoreboard/')) {
      // If on scoreboard, go to categories
      navigate('/categories');
    } else {
      // Default: try to go back in history, or go home
      navigate(-1, { fallback: '/' });
    }
  };
  
  return (
    <button className="back-button" onClick={handleBack}>
      ← Back
    </button>
  );
}

export default BackButton;
