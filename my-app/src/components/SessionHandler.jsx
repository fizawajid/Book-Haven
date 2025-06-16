import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionHandler = ({ userData, onLogout }) => {
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') return;
  
    const controller = new AbortController();
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:8000/reader/check-session', {
          credentials: 'include',
          signal: controller.signal
        });
  
        if (!response.ok) {
          sessionStorage.clear(); 
          alert('Your session has expired. Please log in again.');
          onLogout();
          navigate('/');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        sessionStorage.clear();
        alert('Session error. Please log in again.');
        onLogout();
        navigate('/');
      }
    };
  
    const interval = setInterval(checkSession, 30000);
  
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [location.pathname, navigate]);
  
   
  return null; // This component doesn't render anything
};

export default SessionHandler; 