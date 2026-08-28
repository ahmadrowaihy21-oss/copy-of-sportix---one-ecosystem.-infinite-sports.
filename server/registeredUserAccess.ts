export type RegisteredUserAccessStatus = "pending" | "approved" | "rejected" | "suspended";

export function canEnterRegisteredUserSpace(
  role: "admin" | "user" | null | undefined,
  accessStatus: RegisteredUserAccessStatus | null | undefined,
): boolean {
  return role === "user" && accessStatus === "approved";
}

export function isRegisteredUserAccessStatus(value: string): value is RegisteredUserAccessStatus {
  return ["pending", "approved", "rejected", "suspended"].includes(value);
}
