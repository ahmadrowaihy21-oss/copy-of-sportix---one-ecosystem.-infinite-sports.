import { trpc } from "@/lib/trpc";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import React from "react";
import "../partner-profile.css";

const frequencyLabel: Record<string, string> = { "0": "Not currently active", "1-2": "1–2 sessions per week", "3-4": "3–4 sessions per week", "5+": "5+ sessions per week" };

export default function PartnerProfile() {
  const profile = trpc.partnerAuth.session.useQuery();
  if (profile.isLoading) return <main className="partner-profile-page" />;
  if (!profile.data) return null;
  const account = profile.data;
  const gender = account.gender === "male" ? "Male" : account.gender === "female" ? "Female" : "Not completed";
  return <main className="partner-profile-page">
    <div className="partner-profile-grid" aria-hidden="true" />
    <section className="partner-profile-shell">
      <a href="/" className="partner-profile-back"><ArrowLeft size={16} /> BACK TO SPORTIX</a>
      <header className="partner-profile-hero">
        {account.profileImageUrl ? <img src={account.profileImageUrl} alt={`${account.fullName} profile`} /> : <span>{account.fullName.slice(0, 1).toUpperCase()}</span>}
        <div><p>SPORTIX PARTNERS / VERIFIED PROFILE</p><h1>{account.fullName}</h1><small><ShieldCheck size={14} /> EMAIL VERIFIED</small></div>
      </header>
      <div className="partner-profile-columns">
        <section><p className="partner-profile-label">ATHLETE SNAPSHOT</p><dl><div><dt>Age</dt><dd>{account.age ?? "Not completed"}</dd></div><div><dt>Gender</dt><dd>{gender}</dd></div><div><dt>Weekly Sport Frequency</dt><dd>{account.weeklySportFrequency ? frequencyLabel[account.weeklySportFrequency] : "Not completed"}</dd></div><div><dt>Sports I Practice</dt><dd>{account.currentSports ?? "Not completed"}</dd></div><div><dt>Sport I Want To Practice</dt><dd>{account.aspirationalSport ?? "Not completed"}</dd></div></dl></section>
        <section><p className="partner-profile-label">SPORTIX INSIGHT</p><div className="partner-profile-answer"><h2>Challenges Worth Solving</h2><p>{account.sportsChallenges ?? "Not completed"}</p></div><div className="partner-profile-answer"><h2>My Sports Solution Idea</h2><p>{account.sportsSolutionIdea ?? "Not completed"}</p></div></section>
      </div>
    </section>
  </main>;
}
