import { Navigate } from "react-router-dom";
import { authService } from "../services/auth.service";

const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    const token = localStorage.getItem("token");

    if (!token || !user || user.role !== 'admin') {
        // Redirect to home if not admin
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default AdminRoute;
