const API_URL = 'https://opentdb.com';
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let lastRequestTime = 0;
let sessionToken = null;
const questionCache = {};

// Helper function to sleep for a specified time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API = {
  // Get a session token to improve rate limiting
  getSessionToken: async () => {
    if (sessionToken) return sessionToken;
    
    try {
      // Wait if needed to respect rate limits
      const now = Date.now();
      const timeToWait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
      if (timeToWait > 0) {
        await sleep(timeToWait);
      }
      
      lastRequestTime = Date.now();
      const response = await fetch(`${API_URL}/api_token.php?command=request`);
      const data = await response.json();
      
      if (data.response_code === 0) {
        console.log('Got session token:', data.token);
        sessionToken = data.token;
        return sessionToken;
      } else {
        console.error('Failed to get session token:', data);
        return null;
      }
    } catch (error) {
      console.error('Error getting session token:', error);
      return null;
    }
  },
  
  fetchCategories: async () => {
    try {
      // Check if we need to wait before making another request
      const now = Date.now();
      const timeToWait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
      
      if (timeToWait > 0) {
        console.log(`Waiting ${timeToWait}ms before fetching categories...`);
        await sleep(timeToWait);
      }
      
      lastRequestTime = Date.now();
      console.log('Fetching categories...');
      const response = await fetch(`${API_URL}/api_category.php`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categories fetched:', data.trivia_categories);
      return data.trivia_categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  fetchQuestions: async (category, difficulty, retries = 3) => {
    // Check cache first
    const cacheKey = `${category}-${difficulty}`;
    if (questionCache[cacheKey]) {
      console.log('Returning cached questions for', cacheKey);
      return questionCache[cacheKey];
    }
    
    try {
      // Get a session token if we don't have one
      const token = await API.getSessionToken();
      
      // Check if we need to wait before making another request
      const now = Date.now();
      const timeToWait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
      
      if (timeToWait > 0) {
        console.log(`Waiting ${timeToWait}ms before fetching questions...`);
        await sleep(timeToWait);
      }
      
      lastRequestTime = Date.now();
      console.log(`Making API request for category ${category} and difficulty ${difficulty}`);
      
      let url = `${API_URL}/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
      
      // Add the token if we have one
      if (token) {
        url += `&token=${token}`;
      }
      
      console.log('API URL:', url);
      const response = await fetch(url);
      console.log('API response status:', response.status);
      
      if (response.status === 429 && retries > 0) {
        // Rate limited, wait and retry with exponential backoff
        const waitTime = Math.pow(2, 4 - retries) * 1000; // 2^(4-retries) seconds
        console.log(`Rate limited. Waiting ${waitTime/1000} seconds before retry...`);
        await sleep(waitTime);
        return API.fetchQuestions(category, difficulty, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.response_code === 0 && Array.isArray(data.results)) {
        // Cache the results
        questionCache[cacheKey] = data.results;
        return data.results;
      } else if (data.response_code === 4) {
        // Token empty (all questions used), reset token and try again
        console.log('Token empty, resetting token and trying again');
        sessionToken = null;
        if (retries > 0) {
          return API.fetchQuestions(category, difficulty, retries - 1);
        } else {
          console.error('No more questions available after token reset');
          return [];
        }
      } else {
        console.error('API returned an error or invalid format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (retries > 0) {
        const waitTime = Math.pow(2, 4 - retries) * 1000;
        console.log(`Error occurred. Retrying in ${waitTime/1000} seconds...`);
        await sleep(waitTime);
        return API.fetchQuestions(category, difficulty, retries - 1);
      }
      throw error;
    }
  },
};

export default API;
