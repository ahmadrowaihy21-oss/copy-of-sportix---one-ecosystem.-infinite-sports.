import { ArrowUpRight, Phone, Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import SportixBrandMark from "../components/SportixBrandMark";
import "../individual-access.css";

const founderPhone = "+966545022063";
const accessMusicUrl = "/manus-storage/sportix-orbit-loop_65cdd0ee.mp3";

export default function IndividualAccess() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPause = () => setIsAudioPlaying(false);
    const onPlay = () => setIsAudioPlaying(true);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isAudioPlaying) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setIsAudioPlaying(false);
    }
  };

  return (
    <main className="individual-access" dir="rtl">
      <audio ref={audioRef} loop preload="metadata">
        <source src={accessMusicUrl} type="audio/mpeg" />
      </audio>
      <div className="individual-access-background" aria-hidden="true" />
      <div className="individual-access-stars" aria-hidden="true" />
      <div className="individual-access-orbit individual-access-orbit-one" aria-hidden="true" />
      <div className="individual-access-orbit individual-access-orbit-two" aria-hidden="true" />

      <header className="individual-access-header">
        <span>SPORTIX / ACCESS CHANNEL</span>
        <button
          type="button"
          className="individual-access-audio"
          onClick={toggleAudio}
          aria-pressed={isAudioPlaying}
        >
          {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{isAudioPlaying ? "إيقاف الموسيقى" : "تشغيل التجربة الصوتية"}</span>
        </button>
      </header>

      <section className="individual-access-content" aria-labelledby="individual-access-title">
        <div className="individual-access-launch" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <SportixBrandMark alt="SPORTIX ECOSYSTEM" className="individual-access-logo" />
        <p className="individual-access-kicker">SPORTIX ECOSYSTEM / LIVE ACCESS</p>
        <h1 id="individual-access-title">جاهز للانطلاق؟</h1>
        <p className="individual-access-copy">
          هذه المساحة مخصصة للحسابات المعتمدة. تواصل مع المؤسس لفتح الوصول، أو اخرج وعاود الدخول بإيميل شركتك.
        </p>

        <div className="individual-access-actions">
          <a className="individual-access-contact" href={`tel:${founderPhone}`}>
            <span className="individual-access-contact-icon"><Phone size={22} /></span>
            <span>
              <strong>تواصل مع المؤسس</strong>
              <small>للسماح لك بالدخول</small>
            </span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <a className="individual-access-partner-link" href="/partner-access">
            اخرج وعاود الدخول بإيميل شركتك <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="individual-access-footer">
        <span>ONE ID. EVERY MOVE.</span>
        <span>PRIVATE ACCESS / SPORTIX</span>
      </footer>
    </main>
  );
}
