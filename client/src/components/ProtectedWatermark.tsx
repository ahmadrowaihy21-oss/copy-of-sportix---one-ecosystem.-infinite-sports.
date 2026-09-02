import SportixBrandMark from "./SportixBrandMark";
import { trpc } from "@/lib/trpc";
import "../protected-watermark.css";

export default function ProtectedWatermark() {
  const watermark = trpc.branding.protectedWatermark.useQuery(undefined, { retry: false });
  const signature = watermark.data?.signature || "SPORTIX";
  return <div className="protected-watermark" aria-label={`SPORTIX private access approved by ${signature}`}><span className="protected-watermark-copy">SPORTIX PRIVATE ACCESS · APPROVED BY <b>{signature}</b></span><span className="protected-watermark-signature">{signature}</span><SportixBrandMark alt="SPORTIX" className="protected-watermark-logo" /></div>;
}
