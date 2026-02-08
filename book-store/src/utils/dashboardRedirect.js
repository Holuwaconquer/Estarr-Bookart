export const getDashboardPath = (user) => {
  if (!user) return '/login';
  
  // Check localStorage as fallback
  const storedUser = localStorage.getItem('user');
  let role = user.role;
  
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      role = parsed.role || role;
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  
  return role === 'admin' ? '/admin/dashboard' : '/dashboard';
};

// Use in UserLogin.jsx
import { getDashboardPath } from '../utils/dashboardRedirect';

// In handleLogin function:
const redirectPath = getDashboardPath(result.data);
console.log('🔄 Redirecting to:', redirectPath);
setTimeout(() => {
  navigate(redirectPath, { replace: true });
}, 500);