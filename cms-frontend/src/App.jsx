import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import useVisitTracker from "./hooks/useVisitTracker";
import { useAuth } from "./context/useAuth";

function AppInner() {
  useVisitTracker();
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/reset-password"
          element={!user ? <ResetPassword /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/category/:categoryName"
          element={user ? <CategoryPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/post/:id"
          element={user ? <PostDetail /> : <Navigate to="/login" replace />}
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
