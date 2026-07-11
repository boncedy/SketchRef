import { useEffect, useState } from "react";
import { api } from "../api.js";
import { clearUser, getToken, getUser, setSession } from "../user.js";

export default function UserGate({ children }) {
  const [user, setUser] = useState(getUser());
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    setLoading(true);
    api
      .getMe()
      .then(({ user: remoteUser }) => {
        const nextUser = setSession(remoteUser, getToken());
        setUser(nextUser);
      })
      .catch(() => {
        clearUser();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (user) return children(user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) return;
    if (mode === "signup" && !form.name.trim()) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      const result =
        mode === "signup"
          ? await api.register({ ...payload, name: form.name.trim() })
          : await api.login(payload);
      const nextUser = setSession(result.user, result.token);
      setUser(nextUser);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gate">
      <form className="gate__card" onSubmit={handleSubmit}>
        <div className="gate__mark">✎</div>
        <div className="gate__toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`gate__pill ${mode === "login" ? "gate__pill--active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`gate__pill ${mode === "signup" ? "gate__pill--active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>
          {mode === "login"
            ? "Sign in to keep your own done list and pick up where you left off."
            : "Create a local account so your session stays with you across refreshes."}
        </p>
        {mode === "signup" && (
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
          />
        )}
        <input
          autoFocus={mode === "login"}
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Email address"
          type="email"
        />
        <input
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Password"
          type="password"
        />
        {error && <div className="gate__error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading
            ? "Working…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
