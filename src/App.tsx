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
import Auth from "./pages/Auth";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  );
}
