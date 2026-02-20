import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

const PublicRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  const token = localStorage.getItem("token");

  // If user is authenticated, redirect to home
  if (token && user) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise, render the public page (e.g. Login)
  return children;
};

export default PublicRoute;
