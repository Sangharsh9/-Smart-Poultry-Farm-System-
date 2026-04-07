import { useState } from "react";
import Navbar      from "./components/Navbar";
import Dashboard   from "./components/Dashboard";
import EggPage     from "./components/EggPage";

// lazy-load the single-sensor pages if you have them
// import TemperaturePage from "./components/TemperaturePage";
// import HumidityPage    from "./components/HumidityPage";
// import AmmoniaPage     from "./components/AmmoniaPage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div style={{ minHeight:"100vh", background:"#060d18" }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {activePage === "dashboard" && <Dashboard />}
      {activePage === "eggs"      && <EggPage   />}

      {/* add more pages below as you build them */}
      {/* {activePage === "temperature" && <TemperaturePage />} */}
      {/* {activePage === "humidity"    && <HumidityPage />}   */}
      {/* {activePage === "ammonia"     && <AmmoniaPage />}    */}
    </div>
  );
}