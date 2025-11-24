
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import QuizzPage from "./pages/QuizzPage";
import Encyclopedie from "./pages/EncyclopediePage";
import Training from "./pages/TrainingPage";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Test from "./pages/test";
//import Register from "./components/header/Register/Register";
import Login from "./components/header/Login/Login";
import MyAccount from "./pages/MyAccount.tsx";
import Auth from "./pages/Auth";
import Footer from './components/footer/Footer';
import Stats from "./pages/Stats";
//changement : suppression de l'imporpt LINK car inutilisé
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encyclopedie" element={<Encyclopedie />} />
        <Route path="/encyclopedie/:softwareId" element={<Encyclopedie />} />
        <Route path="/quizz" element={<QuizzPage />} />
        <Route path="/training" element={<Training />} />
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mon-compte" element={<MyAccount />} />
        <Route path="/mes-stats" element={<Stats />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;



//  <Route path="/register" element={<Register />} />