import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  storeAuthToken,
  getStoredAuthToken,
  clearStoredAuth,
  getStoredEmail,
  getStoredUser
} from '../services/authService';

const AuthContext = createContext({
  token: null,
  user: null,
  email: null,
  isAuthenticated: false,
  isBootstrapped: false,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    const storedUser = getStoredUser();
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(storedUser);
    } else {
      const storedEmail = getStoredEmail();
      if (storedEmail) {
        setUser({ email: storedEmail });
      }
    }
    setIsBootstrapped(true);
  }, []);

  const login = useCallback((accessToken, refreshToken = null, options = {}) => {
    if (!accessToken) return;
    const userProfile = options.user || (options.email ? { email: options.email } : null);
    storeAuthToken(accessToken, refreshToken, userProfile);
    setToken(accessToken);
    setUser(userProfile);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      email: user?.email || null,
      isAuthenticated: Boolean(token),
      isBootstrapped,
      login,
      logout
    }),
    [isBootstrapped, login, logout, token, user]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

