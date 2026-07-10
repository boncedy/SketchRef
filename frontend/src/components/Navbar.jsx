import { useUser } from "../UserContext.js";
import { clearUser } from "../user.js";

export default function Navbar({ categories, active, onSelect, onAddCategory }) {
  const user = useUser();

  const handleAdd = () => {
    const name = window.prompt("New category name (e.g. Anatomy, Animals):");
    if (name && name.trim()) onAddCategory(name.trim());
  };

  const handleSwitchUser = () => {
    if (window.confirm(`Switch away from "${user.name}"? You'll be asked for a name again.`)) {
      clearUser();
      window.location.reload();
    }
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
      <button className="navbar__user" onClick={handleSwitchUser} title="Switch user">
        {user.name}
      </button>
    </nav>
  );
}
