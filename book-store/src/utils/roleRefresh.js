export const refreshUserRole = async () => {
  try {
    // Get fresh user data from server
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const userData = data.data || data.user;
      
      if (userData) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Check if token is in response
        if (userData.token) {
          localStorage.setItem('token', userData.token);
          localStorage.setItem('accessToken', userData.token);
        }
        
        console.log('✅ User role refreshed:', userData.role);
        return userData;
      }
    }
  } catch (error) {
    console.error('Failed to refresh user role:', error);
  }
  
  return null;
};