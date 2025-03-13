import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Metrics from "@/pages/Metrics";
import Achievements from "@/pages/Achievements";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/metrics" element={<Metrics />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
