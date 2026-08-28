export type RegisteredUserAccessStatus = "pending" | "approved" | "rejected" | "suspended";

export function canEnterRegisteredUserSpace(
  role: "admin" | "user" | null | undefined,
  _accessStatus?: RegisteredUserAccessStatus | null,
): boolean {
  return role === "user";
}

export function isRegisteredUserAccessStatus(value: string): value is RegisteredUserAccessStatus {
  return ["pending", "approved", "rejected", "suspended"].includes(value);
}
