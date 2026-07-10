import { Routes, Route } from "react-router-dom";
import Gallery from "./pages/Gallery.jsx";
import ImageDetail from "./pages/ImageDetail.jsx";
import UserGate from "./components/UserGate.jsx";
import { UserContext } from "./UserContext.js";

export default function App() {
  return (
    <UserGate>
      {(user) => (
        <UserContext.Provider value={user}>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/image/:id" element={<ImageDetail />} />
          </Routes>
        </UserContext.Provider>
      )}
    </UserGate>
  );
}
