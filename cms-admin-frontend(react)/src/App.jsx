import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Drafts from "./pages/Drafts";
import Categories from "./pages/Categories";
import AddUser from "./pages/AddUser";
import NewPost from "./pages/NewPost";
import ManageCategories from "./pages/ManageCategories";

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
          path="/add-user"
          element={
            <RequireAuth>
              <AddUser />
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
      </Routes>
    </BrowserRouter>
  );
}
