import { Routes, Route } from "react-router-dom";
import Gallery from "./pages/Gallery.jsx";
import ImageDetail from "./pages/ImageDetail.jsx";
import { UserContext } from "./UserContext.js";

export default function App() {
  const publicUser = { id: "public", name: "Guest" };

  return (
    <UserContext.Provider value={publicUser}>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/image/:id" element={<ImageDetail />} />
      </Routes>
    </UserContext.Provider>
  );
}
