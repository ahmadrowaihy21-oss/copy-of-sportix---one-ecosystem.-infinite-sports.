import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import SportixBrandMark from "../components/SportixBrandMark";
import { ArrowRight, CircleAlert, ImagePlus, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus } from "lucide-react";
import React, { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import "../partner-auth.css";
import "../partner-profile.css";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";
type GatewayStep = "landing" | "login" | "signup" | "verify" | "forgot" | "reset";
type ProfileImage = { base64: string; mimeType: "image/jpeg" | "image/png" | "image/webp"; preview: string };
export const PENDING_VERIFICATION_EMAIL_KEY = "sportix-partners-pending-verification-email";

export function readPendingVerificationEmail(storage: Pick<Storage, "getItem">) {
  const email = storage.getItem(PENDING_VERIFICATION_EMAIL_KEY)?.trim().toLowerCase() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AuthGateway({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [step, setStep] = useState<GatewayStep>("landing");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [signup, setSignup] = useState({ fullName: "", email: "", mobileNumber: "", password: "", confirmPassword: "", companyName: "", jobTitle: "", age: "", gender: "", weeklySportFrequency: "", currentSports: "", aspirationalSport: "", sportsChallenges: "", sportsSolutionIdea: "", website: "" });
  const [profileImage, setProfileImage] = useState<ProfileImage | null>(null);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resetDigits, setResetDigits] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const utils = trpc.useUtils();

  useEffect(() => {
    const pendingEmail = readPendingVerificationEmail(window.sessionStorage);
    if (pendingEmail) {
      setVerificationEmail(pendingEmail);
      setStep("verify");
    }
  }, []);

  const loginMutation = trpc.partnerAuth.login.useMutation({
    onSuccess: async () => { await utils.partnerAuth.session.invalidate(); onAuthenticated(); },
    onError: error => setMessage(getErrorMessage(error, "We could not sign you in.")),
  });
  const signupMutation = trpc.partnerAuth.signUp.useMutation({
    onSuccess: ({ email }) => { window.sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email); setVerificationEmail(email); setDigits(["", "", "", "", "", ""]); setMessage(""); setStep("verify"); },
    onError: error => setMessage(getErrorMessage(error, "We could not create your account.")),
  });
  const verifyMutation = trpc.partnerAuth.verifyEmail.useMutation({
    onSuccess: async () => { window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY); await utils.partnerAuth.session.invalidate(); setMessage(""); onAuthenticated(); },
    onError: error => setMessage(getErrorMessage(error, "The verification code could not be accepted.")),
  });
  const resendMutation = trpc.partnerAuth.resendCode.useMutation({
    onSuccess: () => setMessage("A fresh verification code has been sent."),
    onError: error => setMessage(getErrorMessage(error, "A new code could not be sent yet.")),
  });
  const passwordResetRequestMutation = trpc.partnerAuth.requestPasswordReset.useMutation({
    onSuccess: () => { setResetDigits(["", "", "", "", "", ""]); setResetPassword(""); setResetConfirmPassword(""); setMessage("If this email belongs to a SPORTIX account, a reset code has been sent."); setStep("reset"); },
    onError: error => setMessage(getErrorMessage(error, "Password recovery could not be started.")),
  });
  const passwordResetMutation = trpc.partnerAuth.resetPassword.useMutation({
    onSuccess: () => { setMessage("Password updated. You can now log in."); setLogin(current => ({ ...current, email: forgotEmail.trim().toLowerCase() })); setStep("login"); },
    onError: error => setMessage(getErrorMessage(error, "Password could not be updated.")),
  });

  const selectStep = (next: GatewayStep) => { if (step === "verify" && next !== "verify") window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY); setMessage(""); setStep(next); };
  const submitLogin = (event: FormEvent) => { event.preventDefault(); setMessage(""); loginMutation.mutate(login); };
  const submitSignup = (event: FormEvent) => {
    event.preventDefault();
    if (signup.password !== signup.confirmPassword) { setMessage("Passwords do not match."); return; }
    setMessage("");
    signupMutation.mutate({ fullName: signup.fullName, email: signup.email, mobileNumber: signup.mobileNumber, password: signup.password, companyName: signup.companyName || undefined, jobTitle: signup.jobTitle || undefined, age: Number(signup.age), gender: signup.gender as "male" | "female", weeklySportFrequency: signup.weeklySportFrequency as "0" | "1-2" | "3-4" | "5+", currentSports: signup.currentSports, aspirationalSport: signup.aspirationalSport, sportsChallenges: signup.sportsChallenges, sportsSolutionIdea: signup.sportsSolutionIdea, website: signup.website, profileImage: profileImage ? { base64: profileImage.base64, mimeType: profileImage.mimeType } : undefined });
  };
  const submitForgot = (event: FormEvent) => { event.preventDefault(); setMessage(""); setForgotEmail(forgotEmail.trim().toLowerCase()); passwordResetRequestMutation.mutate({ email: forgotEmail.trim().toLowerCase() }); };
  const submitReset = (event: FormEvent) => { event.preventDefault(); const code = resetDigits.join(""); if (code.length !== 6) { setMessage("Enter the complete six-digit code."); return; } if (resetPassword !== resetConfirmPassword) { setMessage("Passwords do not match."); return; } setMessage(""); passwordResetMutation.mutate({ email: forgotEmail.trim().toLowerCase(), code, newPassword: resetPassword }); };
  const submitCode = (event: FormEvent) => { event.preventDefault(); const code = digits.join(""); if (code.length !== 6) { setMessage("Enter the complete six-digit code."); return; } setMessage(""); verifyMutation.mutate({ email: verificationEmail, code }); };
  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits(current => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };
  const setResetDigit = (index: number, value: string) => setResetDigits(current => current.map((item, itemIndex) => itemIndex === index ? value.replace(/\D/g, "").slice(-1) : item));
  const handleDigitKey = (event: KeyboardEvent<HTMLInputElement>, index: number) => { if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus(); };
  const handleProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) { setMessage("Profile image must be a JPEG, PNG, or WebP file up to 2 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",")[1];
      if (!base64) { setMessage("Profile image could not be read."); return; }
      setProfileImage({ base64, mimeType: file.type as ProfileImage["mimeType"], preview: result });
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  return <main className="partner-gateway" aria-live="polite">
    <div className="partner-gateway-grid" aria-hidden="true" />
    <section className="partner-gateway-shell">
      <aside className="partner-gateway-brand">
        <SportixBrandMark alt="SPORTIX" className="partner-gateway-logo" />
        <p className="partner-gateway-eyebrow">SPORTIX / PARTNERS</p>
        <h1>THE PARTNER<br /><em>GATEWAY.</em></h1>
        <p>Secure access to the SPORTIX Partners environment. Authenticate to continue into the platform.</p>
        <div className="partner-gateway-signal"><span /> VERIFIED ACCESS / HUMAN PARTNERSHIPS</div>
      </aside>
      <section className="partner-gateway-panel">
        {step === "landing" && <div className="partner-gateway-stage">
          <ShieldCheck size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">SPORTIX PARTNERS</p><h2>WELCOME<br />TO THE <em>GATEWAY.</em></h2><p className="partner-gateway-copy">Log in to your verified account, or create one to enter SPORTIX Partners.</p>
          <button type="button" className="partner-primary" onClick={() => selectStep("login")}>LOG IN <ArrowRight size={17} /></button>
          <button type="button" className="partner-secondary" onClick={() => selectStep("signup")}>SIGN UP <UserPlus size={17} /></button>
        </div>}
        {step === "login" && <form className="partner-gateway-stage" onSubmit={submitLogin}>
          <button type="button" className="partner-back" onClick={() => selectStep("landing")}>← BACK</button><LockKeyhole size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">EXISTING PARTNER</p><h2>LOG <em>IN.</em></h2>
          <label>Email Address<input type="email" autoComplete="email" value={login.email} onChange={event => setLogin({ ...login, email: event.target.value })} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} required /></label>
          <button className="partner-primary" disabled={loginMutation.isPending}>{loginMutation.isPending ? "AUTHENTICATING…" : <>LOG IN <ArrowRight size={17} /></>}</button>
          <button type="button" className="partner-text-action" onClick={() => { setForgotEmail(login.email); setMessage(""); setStep("forgot"); }}>Forgot Password?</button>
          <button type="button" className="partner-text-action" onClick={() => startLogin()}>PROJECT ADMIN? SIGN IN WITH MANUS <ArrowRight size={15} /></button>
        </form>}
        {step === "signup" && <form className="partner-gateway-stage partner-signup" onSubmit={submitSignup}>
          <button type="button" className="partner-back" onClick={() => selectStep("landing")}>← BACK</button><Mail size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">NEW PARTNER</p><h2>CREATE <em>ACCESS.</em></h2>
          <div className="partner-form-grid"><label>Full Name<input autoComplete="name" value={signup.fullName} onChange={event => setSignup({ ...signup, fullName: event.target.value })} required /></label><label>Work Email Address<input type="email" autoComplete="email" value={signup.email} onChange={event => setSignup({ ...signup, email: event.target.value })} required /></label><label>Mobile Number <small>REQUIRED</small><input type="tel" autoComplete="tel" value={signup.mobileNumber} onChange={event => setSignup({ ...signup, mobileNumber: event.target.value })} required /></label><label>Company / Organization <small>OPTIONAL</small><input autoComplete="organization" value={signup.companyName} onChange={event => setSignup({ ...signup, companyName: event.target.value })} /></label><label>Password<small>MINIMUM 7 CHARACTERS</small><input type="password" autoComplete="new-password" minLength={7} value={signup.password} onChange={event => setSignup({ ...signup, password: event.target.value })} required /></label><label>Confirm Password<input type="password" autoComplete="new-password" minLength={7} value={signup.confirmPassword} onChange={event => setSignup({ ...signup, confirmPassword: event.target.value })} required /></label><label className="partner-span-2">Job Title <small>OPTIONAL</small><input autoComplete="organization-title" value={signup.jobTitle} onChange={event => setSignup({ ...signup, jobTitle: event.target.value })} /></label></div>
          <div className="partner-profile-section"><p>YOUR SPORT PROFILE <small>REQUIRED</small></p><div className="partner-form-grid"><label>Age<input type="number" min="13" max="120" inputMode="numeric" value={signup.age} onChange={event => setSignup({ ...signup, age: event.target.value })} required /></label><label>Gender<select value={signup.gender} onChange={event => setSignup({ ...signup, gender: event.target.value })} required><option value="" disabled>Select</option><option value="male">Male</option><option value="female">Female</option></select></label><label>Sport Sessions Per Week<select value={signup.weeklySportFrequency} onChange={event => setSignup({ ...signup, weeklySportFrequency: event.target.value })} required><option value="" disabled>Select</option><option value="0">Not currently active</option><option value="1-2">1–2 times</option><option value="3-4">3–4 times</option><option value="5+">5+ times</option></select></label><label>Sport You Want To Practice<input value={signup.aspirationalSport} onChange={event => setSignup({ ...signup, aspirationalSport: event.target.value })} required /></label><label className="partner-span-2">Sports You Currently Practice<input placeholder="For example: Football, cycling, strength training" value={signup.currentSports} onChange={event => setSignup({ ...signup, currentSports: event.target.value })} required /></label><label className="partner-span-2">Sports Problems You Think Should Be Solved<textarea value={signup.sportsChallenges} onChange={event => setSignup({ ...signup, sportsChallenges: event.target.value })} required /></label><label className="partner-span-2">Your Idea To Solve A Sports Problem<textarea value={signup.sportsSolutionIdea} onChange={event => setSignup({ ...signup, sportsSolutionIdea: event.target.value })} required /></label></div></div>
          <label className="partner-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={signup.website} onChange={event => setSignup({ ...signup, website: event.target.value })} /></label>
          <label className="partner-profile-image"><span><ImagePlus size={17} /> Profile Image <small>OPTIONAL · JPEG, PNG, OR WEBP · 2 MB MAX</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileImage} />{profileImage && <span className="partner-image-preview"><img src={profileImage.preview} alt="Selected profile preview" />Image selected</span>}</label>
          <button className="partner-primary" disabled={signupMutation.isPending}>{signupMutation.isPending ? "CREATING…" : <>CONTINUE <ArrowRight size={17} /></>}</button>
        </form>}
        {step === "forgot" && <form className="partner-gateway-stage" onSubmit={submitForgot}>
          <button type="button" className="partner-back" onClick={() => selectStep("login")}>← BACK</button><KeyRound size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">PASSWORD RECOVERY</p><h2>RESET YOUR<br /><em>PASSWORD.</em></h2><p className="partner-gateway-copy">Enter your account email and we will send a one-time reset code.</p>
          <label>Email Address<input type="email" autoComplete="email" value={forgotEmail} onChange={event => setForgotEmail(event.target.value)} required /></label>
          <button className="partner-primary" disabled={passwordResetRequestMutation.isPending}>{passwordResetRequestMutation.isPending ? "SENDING…" : <>SEND RESET CODE <ArrowRight size={17} /></>}</button>
        </form>}
        {step === "reset" && <form className="partner-gateway-stage" onSubmit={submitReset}>
          <button type="button" className="partner-back" onClick={() => selectStep("forgot")}>← EDIT EMAIL</button><KeyRound size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">PASSWORD RECOVERY</p><h2>ENTER THE<br /><em>RESET CODE.</em></h2><p className="partner-gateway-copy">Enter the six-digit code sent to <strong>{forgotEmail}</strong>, then choose a new password.</p>
          <div className="partner-code-inputs">{resetDigits.map((digit, index) => <input key={index} aria-label={`Password reset digit ${index + 1}`} inputMode="numeric" autoComplete="one-time-code" value={digit} onChange={event => setResetDigit(index, event.target.value)} maxLength={1} />)}</div>
          <label>New Password<small>MINIMUM 7 CHARACTERS</small><input type="password" autoComplete="new-password" minLength={7} value={resetPassword} onChange={event => setResetPassword(event.target.value)} required /></label>
          <label>Confirm New Password<input type="password" autoComplete="new-password" minLength={7} value={resetConfirmPassword} onChange={event => setResetConfirmPassword(event.target.value)} required /></label>
          <button className="partner-primary" disabled={passwordResetMutation.isPending}>{passwordResetMutation.isPending ? "UPDATING…" : <>UPDATE PASSWORD <ArrowRight size={17} /></>}</button>
        </form>}
        {step === "verify" && <form className="partner-gateway-stage" onSubmit={submitCode}>
          <button type="button" className="partner-back" onClick={() => selectStep("signup")}>← EDIT DETAILS</button><KeyRound size={26} className="partner-gateway-icon" /><p className="partner-gateway-kicker">EMAIL VERIFICATION</p><h2>VERIFY YOUR<br /><em>EMAIL.</em></h2><p className="partner-gateway-copy">We sent a six-digit verification code to <strong>{verificationEmail}</strong>.</p>
          <div className="partner-code-inputs">{digits.map((digit, index) => <input key={index} ref={element => { inputs.current[index] = element; }} aria-label={`Verification digit ${index + 1}`} inputMode="numeric" autoComplete="one-time-code" value={digit} onChange={event => setDigit(index, event.target.value)} onKeyDown={event => handleDigitKey(event, index)} maxLength={1} />)}</div>
          <button className="partner-primary" disabled={verifyMutation.isPending}>{verifyMutation.isPending ? "VERIFYING…" : <>VERIFY <ArrowRight size={17} /></>}</button>
          <button type="button" className="partner-text-action" disabled={resendMutation.isPending} onClick={() => { setMessage(""); resendMutation.mutate({ email: verificationEmail }); }}>{resendMutation.isPending ? "SENDING…" : "Resend Code"}</button>
        </form>}
        {message && <p className="partner-gateway-message" role="alert"><CircleAlert size={15} /> {message}</p>}
      </section>
    </section>
  </main>;
}
