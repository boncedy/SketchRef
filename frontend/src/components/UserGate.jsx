import { useState } from "react";
import { getUser, setUserName } from "../user.js";

export default function UserGate({ children }) {
  const [user, setUser] = useState(getUser());
  const [draft, setDraft] = useState("");

  if (user) return children(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setUser(setUserName(draft.trim()));
  };

  return (
    <div className="gate">
      <form className="gate__card" onSubmit={handleSubmit}>
        <div className="gate__mark">✎</div>
        <h1>Who's drawing?</h1>
        <p>
          Pick a name so your own "done" progress is tracked separately from
          everyone else sharing this gallery.
        </p>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit">Start drawing</button>
      </form>
    </div>
  );
}
