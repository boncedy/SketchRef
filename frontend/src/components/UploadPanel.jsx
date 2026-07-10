import { useRef, useState } from "react";

export default function UploadPanel({ categories, defaultCategory, onUpload }) {
  const fileRef = useRef(null);
  const [category, setCategory] = useState(defaultCategory || categories[0]?.id || "uncategorized");
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      for (const file of files) {
        await onUpload(file, category);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="upload-panel">
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <label className="upload-panel__button">
        {busy ? "Adding…" : "+ Add pictures"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={busy}
          onChange={(e) => handleFiles([...e.target.files])}
        />
      </label>
    </div>
  );
}
