import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from './API';
import useNavigationControl from './hooks/useNavigationControl';
import BackButton from './components/BackButton';

function CategorySelection({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useNavigationControl({
    disableBack: false,
  });

  useEffect(() => {
    setLoading(true);
    API.fetchCategories()
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCategory) {
      onCategorySelect(selectedCategory, selectedDifficulty);
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="quiz-page">
      <h1 className="question-text">Quiz App</h1>
      <h2 style={{ marginBottom: '20px', color: '#5c4033' }}>Select a Category</h2>

      <form onSubmit={handleSubmit} className="category-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select 
            id="category" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">-- Select a Category --</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select 
            id="difficulty" 
            value={selectedDifficulty} 
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={!selectedCategory}
          className="back-btn"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          Start Quiz
        </button>

        <BackButton />
      </form>
    </div>
  );
}

CategorySelection.propTypes = {
  onCategorySelect: PropTypes.func.isRequired
};

export default CategorySelection;
