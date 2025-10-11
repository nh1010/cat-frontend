import { NextApiRequest, NextApiResponse } from "next";

// Temporary in-memory storage for cat sightings
const catSightings = [
  { id: 1, lat: 40.7128, lng: -74.006, description: "Black cat near Central Park" },
  { id: 2, lat: 40.73061, lng: -73.935242, description: "Orange tabby spotted on a rooftop" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(catSightings);
  }
  
  if (req.method === "POST") {
    const { lat, lng, description } = req.body;
    if (!lat || !lng || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const newSighting = { id: catSightings.length + 1, lat, lng, description };
    catSightings.push(newSighting);
    return res.status(201).json(newSighting);
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}
