import { useEffect, useRef, useState } from "react";

export default function UploadPanel({ categories, value, onCategoryChange, onUpload }) {
  const fileRef = useRef(null);
  const [category, setCategory] = useState(value || categories[0]?.id || "uncategorized");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const nextValue = value && value !== "all" ? value : categories[0]?.id || "uncategorized";
    setCategory(nextValue);
  }, [value, categories]);

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

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;
    setCategory(nextCategory);
    if (onCategoryChange) onCategoryChange(nextCategory);
  };

  return (
    <div className="upload-panel">
      <select value={category} onChange={handleCategoryChange}>
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
