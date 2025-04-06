import React from 'react';
import PropTypes from 'prop-types';
import useNavigationControl from './hooks/useNavigationControl';

function Home({ setScreen }) {
  // Disable back button on home page
  useNavigationControl({ 
    disableBack: true,
    alertMessage: null // No alert needed on home page
  });

  return (
    <div className="home">
      <h1>Welcome to the Quiz App</h1>
      <p>Test your knowledge and challenge yourself!</p>
      <button onClick={() => setScreen('CategorySelection')}>Start Quiz</button>
    </div>
  );
}

Home.propTypes = {
  setScreen: PropTypes.func.isRequired
};

export default Home;