// Map usernames to their Supabase user IDs
export const usernameToId: Record<string, string> = {
  rtmonly: "537b4ab5-500f-49e4-903d-025fb6c09d54",
  n333mo: "d94c0d42-1494-445b-ad9d-bb08ba927d8b",
  slos: "ff7c352b-7cdd-47ae-bde3-b047610e8334",
  arkham: "ab7355f4-06a9-43cf-be29-9134d8737b22",
  outlaw: "4a01de5b-03f2-42af-8f3c-cd860fabc093", // Assuming outlaw is akaoutlaw
  gekk: "f846905e-1625-47fc-9483-56bb7ae3c79d", // Placeholder ID for gekk
  lydell: "7f7fe66f-bcb4-471a-8151-c9daa9f9ed1d",
  clipzy: "7fe8e0aa-0c79-439a-96bc-c8196a3e6799",
  jack: "9c1bc599-8f18-4a14-b2f2-696db2fda4a1",
  junz: "4bf1fcf4-0db6-4eca-8f39-f689f2096c6c",
  mocha: "cfd859bf-88b2-478e-b8ee-e32f15f29d86",
  said: "acab184c-5a2d-4cd8-a1ce-4e07cd488918",
  scorpy: "21ac1b9e-7c6f-4d21-b972-132d6d7df1e1", // Placeholder ID for scorpy
  trystin: "986e281b-809e-4739-8d2a-292f416cf146", // Placeholder ID for trystin
}

// Get user ID from username
export const getUserIdFromUsername = (username: string): string => {
  return usernameToId[username.toLowerCase()] || ""
}

// Get username from user ID
export const getUsernameFromId = (id: string): string | undefined => {
  const entry = Object.entries(usernameToId).find(([_, userId]) => userId === id)
  return entry ? entry[0] : undefined
}
