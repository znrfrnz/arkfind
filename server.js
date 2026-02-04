import express from "express";
import cors from "cors";
import Papa from "papaparse";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());

const PORT = 5000;

app.get("/api/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    const SHEET_URL = process.env.GOOGLE_SHEET_URL;
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data;
    console.log("RAW GOOGLE RESPONSE:", csvText.substring(0, 500));
    console.log("------------------------------------------------");

    console.log("First Row Keys:", Object.keys(data[0] || {}));
    console.log("First Row Values:", data[0]);
    console.log("Searching For:", query);
    console.log("------------------------------------------------");
    const results = data.filter((person) => {
      // Safety check for undefined values
      const id = person.StudentID ? person.StudentID.toString() : "";
      const name = person.FullName
        ? person.FullName.toString().toLowerCase()
        : "";
      return id === query || name.includes(query.toLowerCase());
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend Server is running on http://localhost:${PORT}`);
});
