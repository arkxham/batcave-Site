// Map usernames to their email addresses
export const getUserEmail = (username: string): string => {
  // Special case for n333mo
  if (username.toLowerCase() === "n333mo") {
    return "nemo@batcave.com"
  }

  // Default pattern: username@batcave.com
  return `${username.toLowerCase()}@batcave.com`
}

// Get username from email (before @)
export const getUsernameFromEmail = (email: string): string => {
  // Special case for nemo@batcave.com
  if (email.toLowerCase() === "nemo@batcave.com") {
    return "n333mo"
  }

  return email.split("@")[0]
}
