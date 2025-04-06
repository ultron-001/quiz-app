const STORAGE_KEY = 'quiz_high_scores';

const LocalStorage = {
  getHighScores() {
    try {
      const scores = localStorage.getItem(STORAGE_KEY);
      return scores ? JSON.parse(scores) : {};
    } catch (error) {
      console.error("Error getting high scores:", error);
      return {};
    }
  },

  saveHighScore(category, difficulty, score) {
    try {
      const scores = this.getHighScores();
      const key = `${category}-${difficulty}`;
      
      console.log("LocalStorage - saving score:", score, "for key:", key);
      console.log("LocalStorage - current high score:", scores[key]);
      
      // Only update if the new score is higher than the existing one
      if (!scores[key] || score > scores[key]) {
        scores[key] = score;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        console.log("LocalStorage - updated high score to:", score);
        return true; // Score was updated
      }
      return false; // Score was not updated
    } catch (error) {
      console.error("Error saving high score:", error);
      return false;
    }
  },

  getHighScore(category, difficulty) {
    try {
      const scores = this.getHighScores();
      const key = `${category}-${difficulty}`;
      return scores[key] || 0;
    } catch (error) {
      console.error("Error getting high score:", error);
      return 0;
    }
  },

  resetHighScore(category, difficulty) {
    try {
      const scores = this.getHighScores();
      const key = `${category}-${difficulty}`;
      if (scores[key]) {
        delete scores[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error resetting high score:", error);
      return false;
    }
  },
};

export default LocalStorage;
