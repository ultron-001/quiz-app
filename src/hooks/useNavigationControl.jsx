import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook to control browser navigation behavior
 * @param {Object} options - Configuration options
 * @param {boolean} options.disableBack - Whether to disable back button
 * @param {string} options.alertMessage - Message to show when back is attempted
 * @param {string} options.redirectTo - Where to redirect after alert (optional)
 */
function useNavigationControl({ disableBack, alertMessage, redirectTo }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to handle popstate (back/forward button) events
    const handlePopState = (event) => {
      // Push current state again to prevent actual navigation
      window.history.pushState(null, '', location.pathname);
      
      if (disableBack) {
        if (alertMessage) {
          alert(alertMessage);
        }
        
        if (redirectTo) {
          navigate(redirectTo);
        }
      }
    };

    // Push state once on component mount to ensure popstate fires on back
    window.history.pushState(null, '', location.pathname);
    
    // Add event listener for popstate
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [disableBack, alertMessage, location.pathname, navigate, redirectTo]);
}

export default useNavigationControl;
