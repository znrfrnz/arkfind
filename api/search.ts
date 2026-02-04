import type { VercelRequest, VercelResponse } from "@vercel/node";
import Papa from "papaparse";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  //  search term from the frontend
  const { query } = req.query;

  if (!query || Array.isArray(query)) {
    return res.status(400).json({ error: "Search term is required" });
  }

  const SHEET_URL = process.env.GOOGLE_SHEET_URL;

  if (!SHEET_URL) {
    return res.status(500).json({ error: "walang sheet url gago" });
  }

  try {
    // fetch csv
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();

    // csv to json
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data as Record<string, string>[];

    // filter results
    const results = data.filter((person) => {
      const id = person.MemberID ? person.MemberID.toString() : "";
      const name = person.FullName
        ? person.FullName.toString().toLowerCase()
        : "";
      const q = query.toLowerCase();

      // returns true if ID matches exactly OR Name contains the search term
      return id === q || name.includes(q);
    });

    //  return only the filtered list
    return res.status(200).json(results);
  } catch {
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
