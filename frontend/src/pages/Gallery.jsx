import { useEffect, useState } from "react";
import { api } from "../api.js";
import Navbar from "../components/Navbar.jsx";
import ImageCard from "../components/ImageCard.jsx";
import UploadPanel from "../components/UploadPanel.jsx";
import { useUser } from "../UserContext.js";

export default function Gallery() {
  const user = useUser();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = () => api.getCategories().then(setCategories);
  const loadImages = (category) =>
    api.getImages(category).then(setImages).catch((e) => setError(e.message));

  useEffect(() => {
    Promise.all([loadCategories(), loadImages(active)])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onImageRenamed = (event) => {
      if (event.detail?.id) {
        setImages((prev) => prev.map((img) => (img.id === event.detail.id ? event.detail.image : img)));
      }
    };
    window.addEventListener("sketchref:image-renamed", onImageRenamed);
    return () => window.removeEventListener("sketchref:image-renamed", onImageRenamed);
  }, []);

  useEffect(() => {
    loadImages(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleAddCategory = (name) => {
    api.addCategory(name).then((cat) => setCategories((prev) => [...prev, cat]));
  };

  const handleUpload = (file, category) =>
    api.uploadImage(file, category).then((img) => {
      if (active === "all" || active === category) setImages((prev) => [...prev, img]);
    });

  const refreshImages = () => {
    api.getImages(active).then(setImages).catch((e) => setError(e.message));
  };

  const handleToggleChecked = (image, done) => {
    api
      .setDone(image.id, user.id, done)
      .then((updated) =>
        setImages((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      );
  };

  const handleRemove = (image) => {
    api.deleteImage(image.id).then(() => setImages((prev) => prev.filter((i) => i.id !== image.id)));
  };

  const doneCount = images.filter((i) => i.doneBy?.includes(user.id)).length;

  return (
    <div className="page">
      <Navbar
        categories={categories}
        active={active}
        onSelect={setActive}
        onAddCategory={handleAddCategory}
      />

      <div className="toolbar">
        <div className="toolbar__count">
          {images.length} reference{images.length === 1 ? "" : "s"}
          {" · "}
          {doneCount} done by you
        </div>
        <UploadPanel
          categories={categories}
          value={active !== "all" ? active : categories[0]?.id}
          onCategoryChange={setActive}
          onUpload={handleUpload}
        />
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {loading ? (
        <div className="empty">Loading your sketchbook…</div>
      ) : images.length === 0 ? (
        <div className="empty">
          Nothing here yet. Add a few pictures above to start building your practice list.
        </div>
      ) : (
        <div className="grid">
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onToggleChecked={handleToggleChecked}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
