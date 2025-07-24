import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBddXs-09rUAOtVw2Dv0TMsTTINsRwjUGw",
  authDomain: "trashmap-6b9fa.firebaseapp.com",
  projectId: "trashmap-6b9fa",
  storageBucket: "trashmap-6b9fa.appspot.com",
  messagingSenderId: "526323389961",
  appId: "1:526323389961:ios:06d4596a6a0e6dca5a0ad8",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser === null) {
        supabase.auth.signOut().catch(console.error);
      }
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    await supabase.auth.signOut().catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
