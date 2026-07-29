import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Drafts from "./pages/Drafts";
import Categories from "./pages/Categories";
import AddAdmin from "./pages/AddAdmin";
import NewPost from "./pages/NewPost";
import ManageCategories from "./pages/ManageCategories";
import QuickBites from "./pages/QuickBites";
import NewQuickBite from "./pages/NewQuickBite";
import Users from "./pages/Users";

function RequireAuth({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/posts"
          element={
            <RequireAuth>
              <Posts />
            </RequireAuth>
          }
        />
        <Route
          path="/drafts"
          element={
            <RequireAuth>
              <Drafts />
            </RequireAuth>
          }
        />
        <Route
          path="/categories"
          element={
            <RequireAuth>
              <Categories />
            </RequireAuth>
          }
        />
        <Route
          path="/add-admin"
          element={
            <RequireAuth>
              <AddAdmin />
            </RequireAuth>
          }
        />
        <Route
          path="/new-post"
          element={
            <RequireAuth>
              <NewPost />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-categories"
          element={
            <RequireAuth>
              <ManageCategories />
            </RequireAuth>
          }
        />
        <Route
          path="/quick-bites"
          element={
            <RequireAuth>
              <QuickBites />
            </RequireAuth>
          }
        />
        <Route
          path="/new-quick-bite"
          element={
            <RequireAuth>
              <NewQuickBite />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <Users />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
