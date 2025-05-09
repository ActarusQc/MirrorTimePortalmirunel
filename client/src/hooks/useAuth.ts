import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, fullName: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const defaultContext: AuthContextType = {
  user: null,
  isLoggedIn: false,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// Provider component
export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('mirrorTime_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('mirrorTime_user');
      }
    }
  }, []);

  // Login function (frontend only for this MVP)
  const login = async (username: string, password: string): Promise<void> => {
    // In a real app, this would make an API call
    // For this frontend-only MVP, we'll simulate authentication
    const mockUsers = JSON.parse(localStorage.getItem('mirrorTime_users') || '[]');
    const foundUser = mockUsers.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsLoggedIn(true);
      localStorage.setItem('mirrorTime_user', JSON.stringify(userWithoutPassword));
    } else {
      throw new Error('Invalid username or password');
    }
  };

  // Register function (frontend only for this MVP)
  const register = async (username: string, password: string, email: string, fullName: string): Promise<void> => {
    // In a real app, this would make an API call
    // For this frontend-only MVP, we'll simulate registration
    const mockUsers = JSON.parse(localStorage.getItem('mirrorTime_users') || '[]');
    
    // Check if user exists
    if (mockUsers.some((u: any) => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    if (mockUsers.some((u: any) => u.email === email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: Date.now(), // Simple way to generate unique IDs
      username,
      password, // In a real app, this would be hashed on the server
      email,
      fullName
    };
    
    // Update users list
    mockUsers.push(newUser);
    localStorage.setItem('mirrorTime_users', JSON.stringify(mockUsers));
    
    // Auto-login after registration
    const { password: pwd, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsLoggedIn(true);
    localStorage.setItem('mirrorTime_user', JSON.stringify(userWithoutPassword));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('mirrorTime_user');
  };

  // Create value object
  const contextValue = {
    user,
    isLoggedIn,
    login,
    register,
    logout
  };

  // Use React.createElement instead of JSX
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    props.children
  );
}

// Hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}
