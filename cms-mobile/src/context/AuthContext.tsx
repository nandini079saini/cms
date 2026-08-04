import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Customer } from '../api/posts';

interface AuthContextType {
  user: Customer | null;
  isLoading: boolean;
  login: (userData: Customer) => Promise<void>;
  logout: () => Promise<void>;
  bookmarks: number[];
  toggleBookmark: (postId: number) => Promise<void>;
  likedPosts: number[];
  toggleLike: (postId: number) => Promise<void>;
}

const STORAGE_KEY_USER = 'cms_mobile_user';
const STORAGE_KEY_BOOKMARKS = 'cms_mobile_bookmarks';
const STORAGE_KEY_LIKED = 'cms_mobile_liked';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  bookmarks: [],
  toggleBookmark: async () => {},
  likedPosts: [],
  toggleLike: async () => {},
});

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn(`Storage get error for ${key}`, e);
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.warn(`Storage set error for ${key}`, e);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    console.warn(`Storage remove error for ${key}`, e);
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await getItem(STORAGE_KEY_USER);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedBookmarks = await getItem(STORAGE_KEY_BOOKMARKS);
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        }
        const storedLiked = await getItem(STORAGE_KEY_LIKED);
        if (storedLiked) {
          setLikedPosts(JSON.parse(storedLiked));
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const login = async (userData: Customer) => {
    setUser(userData);
    await setItem(STORAGE_KEY_USER, JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await removeItem(STORAGE_KEY_USER);
  };

  const toggleBookmark = async (postId: number) => {
    setBookmarks((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(next));
      return next;
    });
  };

  const toggleLike = async (postId: number) => {
    setLikedPosts((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      setItem(STORAGE_KEY_LIKED, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        bookmarks,
        toggleBookmark,
        likedPosts,
        toggleLike,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
