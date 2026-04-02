import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Ads from "./pages/Ads";
import Financial from "./pages/Financial";
import Calculator from "./pages/Calculator";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/fornecedores" element={<Suppliers />} />
        <Route path="/vendas" element={<Sales />} />
        <Route path="/anuncios" element={<Ads />} />
        <Route path="/financeiro" element={<Financial />} />
        <Route path="/calculadora" element={<Calculator />} />
      </Route>
    </Routes>
  );
}
