"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/auth.service";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "explorer" | "stylist";
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  aesthetics?: string[];
  following?: string[];
  followers?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if there's already a session
  useEffect(() => {
    getProfile()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);