import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import './App.css';
import { Home } from "./pages/Home";
import { GroupChat } from "./pages/GroupChat";
import { Navbar } from "./components/Navbar";

function App() {

  return (

    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:groupId" element={<GroupChat />} />
      </Routes>
    </Router>
  );
}

export default App
