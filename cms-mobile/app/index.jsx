import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // or a splash/loading screen

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
