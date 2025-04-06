import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from './API';
import Scoreboard from './Scoreboard';
import Timer from './Timer';
import LocalStorage from './LocalStorage';
import BackButton from './components/BackButton';

function Quiz({ category, difficulty, setScreen }) {
  // All useState hooks must be at the top level
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [highScore, setHighScore] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [selectedAnswerCorrect, setSelectedAnswerCorrect] = useState(null);
  const [timerProgress, setTimerProgress] = useState(100); // Track timer progress

  const QUESTION_TIME = 15; // 15 seconds per question
  const ANSWER_DELAY = 1; // 1 second delay after answering

  // Function to decode HTML entities
  function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  // Function to get high score for current category/difficulty
  const getCurrentHighScore = () => {
    const scores = LocalStorage.getHighScores();
    const key = `${category}-${difficulty}`;
    return scores[key] || 0;
  };

  // All useEffect hooks must be at the top level
  // First useEffect - fetch questions
  useEffect(() => {
    setLoading(true);
    setError(null); // Reset error state
    
    // Get the current high score
    setHighScore(getCurrentHighScore());
    
    // Fetch categories and questions
    API.fetchCategories()
      .then(categories => {
        const selectedCategory = categories.find(cat => cat.id.toString() === category.toString());
        if (selectedCategory) {
          setCategoryName(selectedCategory.name);
        } else {
          setCategoryName(`Category ${category}`);
        }
        
        return API.fetchQuestions(category, difficulty);
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const formattedQuestions = data.map(q => ({
            question: decodeHTML(q.question),
            answers: [
              { text: decodeHTML(q.correct_answer), isCorrect: true },
              ...q.incorrect_answers.map(answer => ({ 
                text: decodeHTML(answer), 
                isCorrect: false 
              }))
            ].sort(() => Math.random() - 0.5)
          }));
          
          setQuestions(formattedQuestions);
        } else {
          setError('No questions found for this category and difficulty');
        }
      })
      .catch(err => {
        if (err.message.includes('429')) {
          setError('Rate limit exceeded. Please wait a moment before trying again.');
        } else {
          setError('Failed to load questions. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, difficulty]);

  // Second useEffect - timer progress
  useEffect(() => {
    let timer;
    if (!timerPaused && timerProgress > 0) {
      timer = setInterval(() => {
        setTimerProgress(prev => {
          const newProgress = prev - (100 / QUESTION_TIME);
          if (newProgress <= 0) {
            setTimerPaused(true);
            handleTimeUp();
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer); // Cleanup the timer on unmount
  }, [timerPaused, timerProgress]);

  // Third useEffect - reset timer progress when question changes
  useEffect(() => {
    setTimerPaused(false);
    setTimerProgress(100);
  }, [currentQuestionIndex]);
    const restartQuiz = () => {
      setScreen('CategorySelection');
    };

    const endQuiz = () => {
      // Only save the score if it's higher than the current high score
      const currentHighScore = getCurrentHighScore();
      console.log("Quiz ending - current score:", score);
      console.log("Quiz ending - current high score:", currentHighScore);
    
      if (score > currentHighScore) {
        // Only save and update if it's a new high score
        LocalStorage.saveHighScore(category, difficulty, score);
        setHighScore(score);
        console.log("Quiz ending - saved new high score:", score);
      } else {
        // Keep the existing high score
        setHighScore(currentHighScore);
      }
    
      setQuizEnded(true);
    };
  // Centralized function to move to the next question
  const moveToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerSelected(false);
      setSelectedAnswerCorrect(null);
      setTimerPaused(false);
      setTimerProgress(100); // Reset progress bar for the new question
    } else {
      endQuiz();
    }
  };

  const handleTimeUp = () => {
    // Don't proceed if an answer was already selected
    if (answerSelected) return;
    
    // Pause timer to prevent multiple timeouts
    setTimerPaused(true);
    
    // Move to next question when time is up (without adding score)
    moveToNextQuestion();
  };

  const handleAnswer = (isCorrect) => {
    // Don't proceed if an answer was already selected
    if (answerSelected) return;
    
    // Pause the timer
    setTimerPaused(true);
    
    // Set answer state
    setAnswerSelected(true);
    setSelectedAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Wait for specified delay before moving to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, ANSWER_DELAY * 1000);
  };

  // Prepare the content based on state
  let content;
  
  if (loading) {
    content = <div className="loading">Loading questions...</div>;
  } else if (error) {
    content = (
      <div className="error">
        <p>{error}</p>
        <button onClick={restartQuiz}>Back to Categories</button>
      </div>
    );
  } else if (quizEnded) {
    content = (
      <div className="quiz-results">
        <Scoreboard 
          category={categoryName}
          categoryId={category}
          difficulty={difficulty}
          score={score}
          highScore={highScore}
          restartQuiz={restartQuiz}
        />
      </div>
    );
  } else if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    content = (
      <div className="quiz">
        <div className="quiz-header">
          <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>

          {/* Timer progress bar - keeping the original class names */}
          <div className="timer-bar-container">
            <div className="timer-bar" style={{ width: `${timerProgress}%` }}></div>
          </div>
        </div>

        <div className="question-container">
          <p className="question-text">{currentQuestion.question}</p>

          <div className="options-container">
            <div className="options-grid">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  className={`option-btn ${answerSelected && answer.isCorrect ? 'correct' : ''} ${answerSelected && !answer.isCorrect ? 'wrong' : ''}`}
                  onClick={() => handleAnswer(answer.isCorrect)}
                  disabled={answerSelected} // Disable the button after selection
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-info">
            <div className="quiz-footer">
              <p>Score: {score}</p>
              <p>High Score: {highScore}</p>
              <p>Category: {categoryName}</p>
              <p>Difficulty: {difficulty}</p>
            </div>
          </div>
        </div>

        <BackButton />
      </div>
    );
  } else {
    content = (
      <div className="no-questions">
        <p>No questions available for this category and difficulty.</p>
        <button onClick={restartQuiz}>Try Different Category</button>
      </div>
    );
  }

  // Single return statement at the end
  return content;
}

Quiz.propTypes = {
  category: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  difficulty: PropTypes.string.isRequired,
  setScreen: PropTypes.func.isRequired
};

export default Quiz;
