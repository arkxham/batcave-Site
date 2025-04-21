// Map usernames to their email addresses
export const usernameToEmail: Record<string, string> = {
  rtmonly: "rtmonly@batcave.com",
  lydell: "lydell@batcave.com",
  arkham: "arkham@batcave.com",
  akaoutlaw: "akaoutlaw@batcave.com",
  junz: "junz@batcave.com",
  jack: "jack@batcave.com",
  clipzy: "clipzy@batcave.com",
  mocha: "mocha@batcave.com",
  n333mo: "nemo@batcave.com",
  said: "said@batcave.com",
  slos: "slos@batcave.com",
  gekk: "gekk@batcave.com",
}

// Map emails to usernames
export const emailToUsername: Record<string, string> = Object.entries(usernameToEmail).reduce(
  (acc, [username, email]) => {
    acc[email] = username
    return acc
  },
  {} as Record<string, string>,
)

// Get email from username
export const getEmailFromUsername = (username: string): string => {
  return usernameToEmail[username.toLowerCase()] || `${username.toLowerCase()}@batcave.com`
}

// Get username from email
export const getUsernameFromEmail = (email: string): string => {
  return emailToUsername[email.toLowerCase()] || email.split("@")[0]
}
