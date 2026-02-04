import { useState } from "react";
import "./App.css";
import type { Member } from "./types";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Fetch from OUR backend, not Google directly
      const res = await fetch(
        `/api/search?query=${encodeURIComponent(searchTerm)}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      console.log("REAL DATA FROM SERVER:", data);
      setResults(data);
    } catch (err) {
      setError("Error connecting to server.");
      console.error("SEARCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}
    >
      <h1>ID Finder</h1>
      <form onSubmit={handleSearch}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Name or ID"
          style={{ padding: "10px", width: "60%", marginRight: "8px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px" }}
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "2rem", textAlign: "left" }}>
        {results.map((member, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{member.FullName}</h3>
            <p>ID: {member.MemberID}</p>
            <p>Role: {member.Role}</p>
            <p>Email: {member.Email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
