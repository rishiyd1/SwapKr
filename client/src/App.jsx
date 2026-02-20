import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import ItemDetail from "./pages/ItemDetail";
import RequestDetail from "./pages/RequestDetail";
import Chats from "./pages/Chats";
import NotFound from "./pages/NotFound";
import { SocketProvider } from "./components/chat/SocketProvider";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SocketProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes (Accessible to everyone) */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />

            {/* Guest Only Routes (Redirect to Home if logged in) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected Routes (Redirect to Login if not logged in) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/item/:id"
              element={
                <ProtectedRoute>
                  <ItemDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request/:id"
              element={
                <ProtectedRoute>
                  <RequestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
