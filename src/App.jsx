import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Home from './Home';
import CategorySelection from './CategorySelection';
import Quiz from './Quiz';
import Scoreboard from './Scoreboard';
import './App.css';

// Wrapper component for Home
function HomeWrapper() {
  const navigate = useNavigate();
  
  const setScreen = (screen) => {
    if (screen === 'CategorySelection') {
      navigate('/categories');
    }
  };
  
  return <Home setScreen={setScreen} />;
}

// Wrapper component for Quiz that extracts URL parameters
function QuizWrapper() {
  const { category, difficulty } = useParams();
  const navigate = useNavigate();
  
  const setScreen = (screen) => {
    if (screen === 'CategorySelection') {
      navigate('/categories');
    }
  };
  
  return (
    <Quiz 
      category={category} 
      difficulty={difficulty} 
      setScreen={setScreen} 
    />
  );
}

// Wrapper component for Scoreboard that extracts URL parameters
function ScoreboardWrapper() {
  const { category, categoryName, difficulty, score, highScore } = useParams();
  const navigate = useNavigate();
  
  const restartQuiz = () => {
    navigate('/categories');
  };
  
  return (
    <Scoreboard 
      category={decodeURIComponent(categoryName)}
      categoryId={category}
      difficulty={difficulty}
      score={parseInt(score, 10)}
      highScore={parseInt(highScore, 10)}
      restartQuiz={restartQuiz}
    />
  );
}

// Wrapper for CategorySelection
function CategorySelectionWrapper() {
  const navigate = useNavigate();
  
  const handleCategorySelect = (category, difficulty) => {
    navigate(`/quiz/${category}/${difficulty}`);
  };
  
  return <CategorySelection onCategorySelect={handleCategorySelect} />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/categories" element={<CategorySelectionWrapper />} />
          <Route path="/quiz/:category/:difficulty" element={<QuizWrapper />} />
          <Route path="/scoreboard/:category/:categoryName/:difficulty/:score/:highScore" element={<ScoreboardWrapper />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
