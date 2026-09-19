import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

/**
 * Authentication helpers
 * 
 * @returns the Cognito ID of the currently authenticated user.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();

  if (!user.userId){
    throw new Error("User ID not found.");
  }
  return user.userId;
}

/**
 * Authentication helpers
 * 
 * @returns the Cognito Email of the currently authenticated user.
 */
export async function getCurrentUserEmail(): Promise<string> {
  const attributes = await fetchUserAttributes();

  const email = attributes.email;

  if (!email) {
    throw new Error("User email not found.");
  }

  return email;
}

/**
 * Masks an owner email before displaying it in the UI.
 *
 * @param email the original owner ID.
 * @returns The first five characters followed by four asterisks.
 */
export function maskOwnerEmail(email: string): string {
  const atIndex = email.indexOf("@");

  if (atIndex === -1){
    return `${email}****`;
  }

  return `${email.slice(0, atIndex)}****`;
}

/**
 * Converts an unknown caught value into a user-friendly error message.
 * 
 * @param error the value caught from a try/catch block.
 * @returns the original error message when the value is an Error; otherwise, a generic fallback message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

/**
 * Status types
 */
export type StatusType = "idle" | "loading" | "success" | "error";

export type StatusMessage = {
  type: StatusType;
  text: string;
};

/**
 * Creates a consistent status object for UI feedback.
 * 
 * @param type 
 * @param text 
 * @returns 
 */
export function createStatus(type: StatusType, text: string): StatusMessage {
  return {type, text};
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toTimeInputValue(date: Date) {
  return date.toTimeString().slice(0, 5);
}

export function formatLocalDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function formatLocalTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScoreOutOf10(rawTlxScore: number) {
  return (rawTlxScore / 10).toFixed(1);
}