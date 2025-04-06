import React from 'react';
import PropTypes from 'prop-types';

function Question({ question, answers, handleAnswer, disabled, selectedAnswerCorrect }) {
  return (
    <div className="question-container">
      <h3 className="question-text">{question}</h3>
      
      <div className="answers-container">
        {answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-button ${
              disabled ? (
                answer.isCorrect ? 'correct-answer' : 
                (selectedAnswerCorrect === false && answer.isCorrect === false) ? 'incorrect-answer' : ''
              ) : ''
            }`}
            onClick={() => !disabled && handleAnswer(answer.isCorrect)}
            disabled={disabled}
          >
            {answer.text}
          </button>
        ))}
      </div>
      
      {disabled && (
        <div className="answer-feedback">
          {selectedAnswerCorrect ? (
            <p className="correct-feedback">Correct! 👍</p>
          ) : (
            <p className="incorrect-feedback">Incorrect! 👎</p>
          )}
        </div>
      )}
    </div>
  );
}

Question.propTypes = {
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      isCorrect: PropTypes.bool.isRequired
    })
  ).isRequired,
  handleAnswer: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  selectedAnswerCorrect: PropTypes.bool
};

Question.defaultProps = {
  disabled: false,
  selectedAnswerCorrect: null
};

export default Question;
