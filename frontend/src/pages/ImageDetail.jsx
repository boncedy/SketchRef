import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../UserContext.js";

export default function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [image, setImage] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState(null);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    api
      .getImages()
      .then((all) => {
        const found = all.find((i) => i.id === id);
        if (!found) {
          setError("This reference no longer exists.");
          return;
        }
        setImage(found);
        setDisplayName(found.displayName || found.originalName.replace(/\.[^/.]+$/, ""));
        setFilename(found.displayName || found.originalName.replace(/\.[^/.]+$/, ""));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const isDone = image?.doneBy?.includes(user.id);

  const handleToggleChecked = () => {
    api.setDone(image.id, user.id, !isDone).then(setImage);
  };

  const handleRemove = () => {
    if (!window.confirm("Remove this reference from your list?")) return;
    api.deleteImage(image.id).then(() => navigate("/"));
  };

  const handleSaveName = async () => {
    if (!image) return;
    setSavingName(true);
    try {
      const updated = await api.updateImage(image.id, { displayName });
      setImage(updated);
      setFilename(updated.displayName || updated.originalName.replace(/\.[^/.]+$/, ""));
      window.dispatchEvent(new CustomEvent("sketchref:image-renamed", { detail: { id: image.id, image: updated } }));
    } finally {
      setSavingName(false);
    }
  };

  if (error) {
    return (
      <div className="page detail">
        <button className="link-back" onClick={() => navigate("/")}>
          ← Back to gallery
        </button>
        <div className="banner banner--error">{error}</div>
      </div>
    );
  }

  if (!image) return <div className="page detail empty">Loading…</div>;

  return (
    <div className="page detail">
      <button className="link-back" onClick={() => navigate("/")}>
        ← Back to gallery
      </button>

      <div className="detail__layout">
        <div className="detail__image-wrap">
          <img className="detail__image" src={api.imageSrc(image.id)} alt={image.originalName} />
        </div>

        <div className="detail__panel">
          <div className="detail__name-row">
            <input
              className="detail__name-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Image name"
            />
            <button className="detail__save-name" onClick={handleSaveName} disabled={savingName}>
              {savingName ? "Saving…" : "Save"}
            </button>
          </div>
          <p className="detail__meta">
            Added {new Date(image.uploadedAt).toLocaleDateString()}
          </p>

          <button
            className={`detail__check ${isDone ? "detail__check--done" : ""}`}
            onClick={handleToggleChecked}
          >
            {isDone ? "✓ Marked as done" : "Mark as done"}
          </button>

          <div className="detail__download">
            <label htmlFor="filename">Save as</label>
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="filename (no extension needed)"
            />
            <a
              className="detail__download-btn"
              href={api.downloadUrl(image.id, filename || image.originalName)}
              download
            >
              ⬇ Download
            </a>
          </div>

          <button className="detail__remove" onClick={handleRemove}>
            Remove from list
          </button>
        </div>
      </div>
    </div>
  );
}
