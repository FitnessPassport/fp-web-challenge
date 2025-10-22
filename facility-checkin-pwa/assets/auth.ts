/**
 * Mock Authentication Utilities for Coding Challenge
 *
 * These functions simulate authentication without requiring a real backend.
 * Use these to test authentication flows in your application.
 *
 * @example
 * // React: Auto-login on app load
 * import { getCurrentUser, login } from './auth';
 *
 * function App() {
 *   const [user, setUser] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     // Check if user is already logged in
 *     const existingUser = getCurrentUser();
 *     if (existingUser) {
 *       setUser(existingUser);
 *     }
 *     setLoading(false);
 *   }, []);
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <LoginScreen onLogin={setUser} />;
 *   return <CheckInScreen user={user} />;
 * }
 *
 * @example
 * // React: Check-in with authentication
 * import { getCurrentUser, isAuthenticated } from './auth';
 *
 * async function handleCheckIn(facilityId) {
 *   if (!isAuthenticated()) {
 *     alert('Please log in first');
 *     return;
 *   }
 *
 *   const user = getCurrentUser();
 *   const token = localStorage.getItem('auth_token');
 *
 *   // Send check-in request with auth token
 *   const response = await fetch('/api/checkin', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${token}`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({ facilityId, userId: user.id })
 *   });
 * }
 */

export interface User {
  id: string;
  email: string;
  name: string;
  membershipType: 'basic' | 'premium' | 'elite';
  memberSince: string;
}

/**
 * Simulates user login with random delay (500-2000ms)
 *
 * @param email - User email
 * @param password - User password (use 'error' to simulate failed login)
 * @returns Promise with JWT token and user object
 * @throws Error if password is 'error'
 */
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  await randomDelay(500, 2000);

  // Mock: always succeeds unless password is 'error'
  if (password === 'error') {
    throw new Error('Invalid credentials');
  }

  const user: User = {
    id: 'user-123',
    email: email,
    name: 'Jane Doe',
    membershipType: 'premium',
    memberSince: '2024-01-15'
  };

  const token = generateMockToken(user);
  return { token, user };
}

/**
 * Simulates token verification with random delay (100-500ms)
 *
 * @param token - JWT token to verify
 * @returns Promise with user object if token is valid
 * @throws Error if token is invalid
 */
export async function verifyToken(token: string): Promise<User> {
  await randomDelay(100, 500);

  // Mock: decode the "token" (it's just base64 encoded user data)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user;
  } catch {
    throw new Error('Invalid token');
  }
}

/**
 * Simulates logout (no-op in this mock)
 */
export function logout(): void {
  // In a real app, this would clear tokens, invalidate sessions, etc.
  return;
}

/**
 * Generates a fake JWT-like token
 * Note: This is NOT cryptographically secure - for testing only!
 */
function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ user, exp: Date.now() + 3600000 }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}

/**
 * Helper for simulating random network delays
 */
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Get current user from stored token (client-side helper)
 * Expects token to be stored in localStorage with key 'auth_token'
 */
export function getCurrentUser(): User | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
