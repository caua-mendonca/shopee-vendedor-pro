import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Ads from "./pages/Ads";
import Financial from "./pages/Financial";
import Calculator from "./pages/Calculator";
import Estoque from "./pages/Estoque";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ShopeeCallback from "./pages/ShopeeCallback";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/shopee/callback" element={<ShopeeCallback />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/fornecedores" element={<Suppliers />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/anuncios" element={<Ads />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/calculadora" element={<Calculator />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
