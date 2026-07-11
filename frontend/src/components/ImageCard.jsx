import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../UserContext.js";

export default function ImageCard({ image, onToggleChecked, onRemove }) {
  const navigate = useNavigate();
  const user = useUser();
  const isDone = image.doneBy?.includes(user.id);

  const handleCheckbox = (e) => {
    e.stopPropagation();
    onToggleChecked(image, !isDone);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (window.confirm("Remove this reference from your list?")) onRemove(image);
  };

  return (
    <div className="card" onClick={() => navigate(`/image/${image.id}`)}>
      <div className="card__frame">
        <img className="card__img" src={api.imageSrc(image.id)} alt={image.originalName} loading="lazy" />
        <div className="card__hover-preview">
          <img src={api.imageSrc(image.id)} alt="" />
        </div>
      </div>

      <button
        className={`card__check ${isDone ? "card__check--done" : ""}`}
        onClick={handleCheckbox}
        title={isDone ? "Mark as not done" : "Mark as done"}
      >
        {isDone ? "✓" : ""}
      </button>

      <button className="card__remove" onClick={handleRemove} title="Remove">
        ×
      </button>

      <div className="card__label">{image.displayName || image.originalName}</div>
    </div>
  );
}
