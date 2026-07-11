import { useUser } from "../UserContext.js";

export default function Navbar({ categories, active, onSelect, onAddCategory }) {
  const user = useUser();

  const handleAdd = () => {
    const name = window.prompt("New category name (e.g. Anatomy, Animals):");
    if (name?.trim()) onAddCategory(name.trim());
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__mark">✎</span> SketchRef
      </div>
      <div className="navbar__tabs">
        <button
          className={`tab ${active === "all" ? "tab--active" : ""}`}
          onClick={() => onSelect("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`tab ${active === c.id ? "tab--active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            {c.name}
          </button>
        ))}
        <button className="tab tab--add" onClick={handleAdd} title="Add a category">
          + category
        </button>
      </div>
      <div className="navbar__user" title="Public gallery">
        {user.name}
      </div>
    </nav>
  );
}
