"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { acknowledgeResearchUse } from "@/app/actions/acknowledgement";

type AcknowledgementGateProps = {
  acknowledged: boolean;
  children: React.ReactNode;
};

export function AcknowledgementGate({ acknowledged, children }: AcknowledgementGateProps) {
  const [isOpen, setIsOpen] = useState(!acknowledged);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isResearchConfirmed, setIsResearchConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const canEnter = isAgeConfirmed && isResearchConfirmed && !isPending;

  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled])");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function enterSite() {
    if (!canEnter) return;
    startTransition(async () => {
      await acknowledgeResearchUse();
      setIsOpen(false);
    });
  }

  function exitSite() {
    window.location.replace("https://www.google.com");
  }

  return <>
    <div aria-hidden={isOpen}>{children}</div>
    {isOpen && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-navy/90 px-4 py-5 backdrop-blur-sm sm:p-8">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(166,225,222,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(166,225,222,.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="acknowledgement-title" aria-describedby="acknowledgement-description" tabIndex={-1} onKeyDown={trapFocus} className="relative w-full max-w-2xl border border-white/15 bg-[#fcfcfa] p-6 shadow-[0_32px_80px_rgba(0,0,0,.4)] outline-none sm:p-10">
        <div className="flex items-start justify-between gap-6 border-b border-navy/10 pb-6"><div><p className="eyebrow">Auneva Research</p><h1 id="acknowledgement-title" className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">Research Use Acknowledgement</h1></div><ShieldCheck className="shrink-0 text-teal" size={32} aria-hidden="true" /></div>
        <p id="acknowledgement-description" className="mt-6 text-base leading-7 text-slate-600">Products offered through Auneva Research are intended exclusively for legitimate laboratory and research purposes. They are not intended for human or veterinary consumption, diagnosis, treatment, cure, or prevention of disease.</p>
        <div className="mt-7 space-y-4">
          <label className="flex cursor-pointer gap-3 border border-navy/15 bg-white p-4 text-sm leading-6 text-ink transition-colors hover:border-teal"><input type="checkbox" checked={isAgeConfirmed} onChange={(event) => setIsAgeConfirmed(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-teal" /><span>I confirm that I am 21 years of age or older.</span></label>
          <label className="flex cursor-pointer gap-3 border border-navy/15 bg-white p-4 text-sm leading-6 text-ink transition-colors hover:border-teal"><input type="checkbox" checked={isResearchConfirmed} onChange={(event) => setIsResearchConfirmed(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-teal" /><span>I understand that products offered on this website are sold exclusively for legitimate laboratory/research purposes and are not intended for human or veterinary consumption.</span></label>
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">This acknowledgement does not replace applicable legal, regulatory, institutional, or safety requirements.</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={exitSite} className="inline-flex min-h-12 items-center justify-center gap-2 px-4 text-xs font-bold uppercase tracking-[.08em] text-navy underline underline-offset-4 hover:text-teal">Exit site <ExternalLink size={15} /></button><button type="button" disabled={!canEnter} onClick={enterSite} className="button-primary disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">{isPending ? "Entering..." : "Enter Auneva Research"} <ArrowRight size={17} /></button></div>
      </div>
    </div>}
  </>;
}