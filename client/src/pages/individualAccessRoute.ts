export function isPartnerGatewayPath(location: string): boolean {
  return location === "/partner-access" || location === "/partner-access/nda" || location === "/partner-access/pending";
}

export function isAdminPath(location: string): boolean {
  return location.startsWith("/admin/");
}
