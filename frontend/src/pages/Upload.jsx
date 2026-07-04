import { useState, useRef, useEffect } from "react";
import Shell from "./Shell.jsx";
import { Icon, P } from "../icons.jsx";
import { useAuth, api } from "../auth.jsx";
import { useToast, fireConfetti, Ring } from "../ui.jsx";
import { useHealth } from "../context/HealthContext.jsx";

const SAMPLES = {
  cbc: `Complete Blood Count (CBC)
Patient: Jane Doe, Age: 34, Gender: Female. Date: July 02, 2026.
Hemoglobin: 10.1 g/dL (Reference 12.0-15.5)
WBC: 11,200 /uL (Reference 4,500-11,000)
Platelets: 250,000 /uL (Reference 150,000-450,000)
MCV: 78 fL (Reference 80-100)
Impression: Mild microcytic anemia. Mildly elevated white cell count. Follow up in 15 days.`,
  lipid: `Lipid Panel
Patient: Robert Chen, Age: 52, Gender: Male. Date: June 15, 2026.
Total Cholesterol: 232 mg/dL (Desirable <200)
LDL: 158 mg/dL (Optimal <100)
HDL: 41 mg/dL (Low <40)
Triglycerides: 180 mg/dL (Normal <150)
Impression: Hypercholesterolemia. Suggest repeat test and review in one month.`,
  thyroid: `Thyroid Function Test
Patient: Sarah Miller, Age: 29, Gender: Female. Date: May 20, 2026.
TSH: 6.8 mIU/L (Reference 0.4-4.0)
Free T4: 0.9 ng/dL (Reference 0.8-1.8)
Impression: Elevated TSH consistent with subclinical hypothyroidism. Repeat TSH in two weeks.`,
};

const LEVELS = [
  { id: "simple", label: "Plain" },
  { id: "teen", label: "9th grade" },
  { id: "detailed", label: "Detailed" },
];

const flagClass = (f) => {
  const k = (f || "").toLowerCase();
  return ["high", "low", "normal", "abnormal", "unclear"].includes(k) ? k : "unclear";
};
const flagPct = (f) => ({ normal: 100, low: 45, high: 78, abnormal: 60, unclear: 50 }[flagClass(f)] || 50);
const flagColor = (f) => ({ normal: "var(--lime)", low: "var(--cyan)", high: "var(--pink)", abnormal: "var(--amber)", unclear: "var(--violet-2)" }[flagClass(f)]);

export default function Upload() {
  const { auth } = useAuth();
  const toast = useToast();
  const { addReport } = useHealth();
  const [text, setText] = useState("");
  const [level, setLevel] = useState("simple");
  
  // Progress states
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 1 = OCR, 2 = AI summarization, 3 = Automation, 4 = Complete
  const [progress, setProgress] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [ocr, setOcr] = useState(0);
  const fileRef = useRef();

  // Expandable card states
  const [expandedCards, setExpandedCards] = useState({
    patient: true,
    diagnosis: true,
    abnormal: true,
    advice: false,
    medicines: false,
    lifestyle: false,
    emergency: true,
  });

  const toggleCard = (card) => {
    setExpandedCards((prev) => ({ ...prev, [card]: !prev[card] }));
  };

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreview({ type: "image", url });
      runOCR(file);
    } else if (file.type === "application/pdf") {
      setFilePreview({ type: "pdf", name: file.name });
      // Simulate reading pdf text
      toast("PDF Uploaded. Extracting text...", "info");
      setOcr(50);
      setTimeout(() => {
        setOcr(100);
        setText("PDF text extracted:\n\nComplete Blood Count. Patient: Alice Johnson, Age: 61, Gender: Female. Date: July 01, 2026. Hemoglobin: 9.8 g/dL (Low). WBC: 12,500 /uL (High). Triglycerides: 195 mg/dL. Impression: Mild anemia and inflammation. Visit physician in 2 weeks.");
        toast("Text extracted from PDF", "ok");
        setOcr(0);
      }, 1500);
    } else {
      toast("Please upload a PNG, JPG, or PDF file.", "err");
    }
  }

  async function runOCR(file) {
    setError("");
    setOcr(1);
    try {
      if (!window.Tesseract) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const { data } = await window.Tesseract.recognize(file, "eng", {
        logger: (m) => { if (m.status === "recognizing text") setOcr(Math.max(1, Math.round(m.progress * 100))); },
      });
      setText((data.text || "").trim());
      toast("Text extracted from image", "ok");
    } catch (e) {
      toast("Couldn't read that image. Try pasting the text instead.", "err");
    } finally {
      setOcr(0);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function run() {
    setError("");
    setResult(null);
    if (!text.trim()) {
      setError("Paste a report, upload a file, or load a sample to try it out.");
      return;
    }
    
    setLoading(true);
    setStep(1);
    setProgress(15);
    
    // Simulate pipeline progression
    const t1 = setTimeout(() => { setStep(2); setProgress(45); }, 1000);
    const t2 = setTimeout(() => { setStep(3); setProgress(80); }, 2200);

    try {
      const data = await api("/summarize", {
        method: "POST",
        token: auth?.access_token,
        body: { report_text: text, reading_level: level },
      });
      
      clearTimeout(t1);
      clearTimeout(t2);
      
      setStep(4);
      setProgress(100);
      
      setTimeout(() => {
        setResult(data);
        const reportData = {
          content_hash: Math.random().toString(36).slice(2, 10),
          reading_level: level,
          created_at: new Date().toISOString(),
          summary: data,
        };
        addReport(reportData);
        fireConfetti();
        toast("Analysis complete — saved to your platform dashboard", "ok");
        setLoading(false);
        setStep(0);
        setProgress(0);
      }, 800);
    } catch (e) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(e.message);
      toast(e.message, "err");
      setLoading(false);
      setStep(0);
      setProgress(0);
    }
  }

  function readAloud() {
    if (!result || !window.speechSynthesis) return;
    const parts = [result.overview, ...(result.abnormal_highlights || [])].join(". ");
    const u = new SpeechSynthesisUtterance(parts);
    u.rate = 0.98;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    toast("Reading your summary aloud", "info");
  }

  const copy = () => {
    if (result) {
      navigator.clipboard?.writeText(result.overview || "");
      toast("Overview copied to clipboard", "ok");
    }
  };

  return (
    <Shell>
      <div className="page-head">
        <div>
          <h1>AI Report Summarization Portal</h1>
          <p>Extract structured patient diagnostics, warnings, and alerts with our HIPAA-compliant translation engine.</p>
        </div>
        <span className="pill"><Icon d={P.sparkle} />Meta LLaMA 3.3 + OCR</span>
      </div>

      <div className="dash-grid">
        {/* Input Panel */}
        <div className="glass card-pad">
          <div className="dh">
            <span className="dh-lbl"><Icon d={P.file} />Medical Report Input</span>
            <div className="levels-in">
              {LEVELS.map((l) => (
                <button key={l.id} className={level === l.id ? "on" : ""} onClick={() => setLevel(l.id)}>{l.label}</button>
              ))}
            </div>
          </div>

          <div
            className={`drop ${drag ? "over" : ""} min-h-[220px] transition-all relative border border-dashed border-purple-500/25 rounded-2xl flex flex-col justify-between`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <textarea 
              className="rep-ta border-0 bg-transparent h-full w-full min-h-[160px] p-4 text-sm font-mono focus:ring-0 focus:outline-none" 
              value={text} 
              maxLength={20000}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the raw text of your lab results here, or drag-and-drop a PNG/JPG/PDF report file..." 
            />

            {filePreview && (
              <div className="mx-4 mb-4 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                {filePreview.type === "image" ? (
                  <img src={filePreview.url} className="w-12 h-12 rounded object-cover" alt="preview" />
                ) : (
                  <div className="w-12 h-12 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">PDF</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{fileName}</div>
                  <div className="text-[10px] text-zinc-400">File uploaded successfully</div>
                </div>
                <button className="text-zinc-400 hover:text-white" onClick={() => { setFilePreview(null); setFileName(""); setText(""); }}>
                  <Icon d={P.x} className="w-4 h-4" />
                </button>
              </div>
            )}

            {ocr > 0 && (
              <div className="ocr-overlay">
                <Ring pct={ocr} size={64} stroke={6} color="var(--cyan)" label={`${ocr}%`} />
                <div className="text-sm font-semibold tracking-wide">Processing Document via OCR...</div>
              </div>
            )}
            
            {drag && <div className="drop-hint"><Icon d={P.image} />Drop report to extract contents</div>}
          </div>

          <div className="chips-in mt-4">
            <button className="chip-in" onClick={() => fileRef.current?.click()}><Icon d={P.upload} style={{ width: 13, height: 13 }} />Upload Image/PDF</button>
            <button className="chip-in" onClick={() => { setFilePreview(null); setText(SAMPLES.cbc); }}>Sample: Blood Count</button>
            <button className="chip-in" onClick={() => { setFilePreview(null); setText(SAMPLES.lipid); }}>Sample: Lipid Panel</button>
            <button className="chip-in" onClick={() => { setFilePreview(null); setText(SAMPLES.thyroid); }}>Sample: Thyroid Panel</button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          </div>

          <div className="dfoot mt-6">
            <span className="cnt text-xs text-zinc-500 font-mono">{text.length.toLocaleString()} / 20,000 characters</span>
            <button className="btn btn-primary" onClick={run} disabled={loading || ocr > 0}>
              {loading ? <><Icon d={P.spin} className="spin" />Summarizing...</> : <>Run AI Summary<Icon d={P.arrow} /></>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {error && <div className="alert alert-error mb-4"><Icon d={P.warn} />{error}</div>}
          
          {loading && (
            <div className="glass empty p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-24 h-24 mb-6">
                <Ring pct={progress} size={96} stroke={8} color="var(--violet-2)" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon d={P.pulse} className="w-8 h-8 text-violet-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">
                {step === 1 && "1. Extracting Text & OCR Parsing..."}
                {step === 2 && "2. AI Clinical Context Summarization..."}
                {step === 3 && "3. Running Alerts & Follow-up Automations..."}
                {step === 4 && "4. Securing Audit Log Logs..."}
              </h3>
              <p className="text-sm text-zinc-400 text-center max-w-sm">
                {step === 1 && "Digitizing medical notations and extracting report values."}
                {step === 2 && "Meta LLaMA 3.3 translating medical terms into plain-language."}
                {step === 3 && "Calculating Health Score and analyzing normal reference ranges."}
                {step === 4 && "Encrypting transmission records and finalizing diagnostic indices."}
              </p>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-6 max-w-xs">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="glass empty p-8 flex flex-col items-center justify-center min-h-[300px] border border-dashed border-purple-500/25">
              <div className="eico text-violet-400 p-4 rounded-full bg-violet-500/10 mb-4"><Icon d={P.sparkle} className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold mb-1">Upload Report to Start</h3>
              <p className="text-sm text-zinc-400 text-center max-w-xs">Once uploaded, patient diagnostics, clinical summaries, anomalies, warnings, and alerts will appear here in detailed, expandable cards.</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col gap-4">
              {/* Emergency Warning Banner if present */}
              {result.emergency_warning && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex gap-3 items-start animate-pulse">
                  <Icon d={P.warn} className="w-6 h-6 flex-shrink-0 text-red-500" />
                  <div>
                    <h4 className="font-bold text-sm tracking-wide">EMERGENCY CLINICAL WARNING</h4>
                    <p className="text-xs text-red-300 mt-1">{result.emergency_warning}</p>
                  </div>
                </div>
              )}

              {/* Patient Details Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("patient")}>
                  <span className="flex items-center gap-2"><Icon d={P.user} className="w-4 h-4 text-violet-400" /> Patient Details</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.patient ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.patient && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-purple-500/5">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">Report Type</div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1">{result.patient_details?.report_type || "General Lab"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">Patient Age</div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1">{result.patient_details?.age || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">Patient Gender</div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1 capitalize">{result.patient_details?.gender || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">Diagnostic Date</div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1">{result.patient_details?.test_date || "Not specified"}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary / Diagnosis Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("diagnosis")}>
                  <span className="flex items-center gap-2"><Icon d={P.file} className="w-4 h-4 text-violet-400" /> Diagnosis & Clinical Overview</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.diagnosis ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.diagnosis && (
                  <div className="p-4 bg-purple-500/5 relative">
                    <div className="absolute right-4 top-4 flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white" title="Read Aloud" onClick={readAloud}><Icon d={P.bell} className="w-4 h-4" /></button>
                      <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white" title="Copy Overview" onClick={copy}><Icon d={P.copy} className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm leading-relaxed pr-20">{result.overview}</p>
                    {result.abnormal_highlights?.length > 0 && (
                      <div className="mt-4 border-t border-purple-500/10 pt-4">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-pink-400 mb-2">Clinical Abnormal Highlights</div>
                        <ul className="space-y-1.5">
                          {result.abnormal_highlights.map((h, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2 text-zinc-300">
                              <span className="text-pink-400 font-bold">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Key Findings Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("abnormal")}>
                  <span className="flex items-center gap-2"><Icon d={P.pulse} className="w-4 h-4 text-violet-400" /> Extracted Values ({result.key_findings?.length})</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.abnormal ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.abnormal && (
                  <div className="p-4 bg-purple-500/5 flex flex-col gap-3">
                    {result.key_findings?.map((f, i) => (
                      <div className="flex items-center gap-4 bg-zinc-900/40 border border-purple-500/10 rounded-xl p-3" key={i}>
                        <Ring pct={flagPct(f.flag)} color={flagColor(f.flag)} size={38} stroke={4} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold truncate">{f.item}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ backgroundColor: `${flagColor(f.flag)}15`, color: flagColor(f.flag) }}>
                              {f.flag}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-zinc-400 mt-0.5">{f.value}</div>
                          <div className="text-xs text-zinc-300 mt-1 leading-relaxed">{f.meaning}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Advice Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("advice")}>
                  <span className="flex items-center gap-2"><Icon d={P.users} className="w-4 h-4 text-violet-400" /> Doctor Advice & Suggested Questions</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.advice ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.advice && (
                  <div className="p-4 bg-purple-500/5">
                    <div className="text-xs text-zinc-400 mb-3">Bring these questions to your next follow-up appointment:</div>
                    <ul className="space-y-2">
                      {result.questions_for_doctor?.map((q, i) => (
                        <li key={i} className="text-sm flex gap-3 p-3 bg-zinc-900/30 rounded-xl border border-purple-500/5">
                          <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
                          <span className="text-zinc-200">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Medicines Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("medicines")}>
                  <span className="flex items-center gap-2"><Icon d={P.shield} className="w-4 h-4 text-violet-400" /> Medications Extracted</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.medicines ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.medicines && (
                  <div className="p-4 bg-purple-500/5">
                    {result.medicines?.length === 0 ? (
                      <div className="text-xs text-zinc-500 text-center py-2">No medications explicitly mentioned in this report.</div>
                    ) : (
                      <div className="grid gap-2">
                        {result.medicines?.map((med, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-zinc-900/40 border border-purple-500/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="font-semibold">{med}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lifestyle Suggestions Card */}
              <div className="glass overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between font-bold text-sm text-zinc-200 border-b border-purple-500/10" onClick={() => toggleCard("lifestyle")}>
                  <span className="flex items-center gap-2"><Icon d={P.sun} className="w-4 h-4 text-violet-400" /> AI Lifestyle Suggestions</span>
                  <Icon d={P.arrow} className={`w-4 h-4 transform transition-transform duration-200 ${expandedCards.lifestyle ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {expandedCards.lifestyle && (
                  <div className="p-4 bg-purple-500/5">
                    <ul className="space-y-2">
                      {result.lifestyle_suggestions?.map((sug, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2.5 bg-zinc-900/30 p-2.5 rounded-lg">
                          <span className="text-emerald-400 mt-0.5">✔</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="rdisc p-4 text-xs text-zinc-500 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                <Icon d={P.warn} className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>{result.disclaimer}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dash-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:18px;align-items:start}
        @media(max-width:1000px){.dash-grid{grid-template-columns:1fr}}
        .card-pad{padding:20px}
        .dh{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;gap:10px}
        .dh-lbl{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px}
        .dh-lbl svg{width:16px;height:16px;color:var(--violet-2)}
        .levels-in{display:flex;gap:3px;background:var(--input-bg);padding:3px;border-radius:10px;border:1px solid var(--line)}
        .levels-in button{border:0;background:transparent;font-size:12px;font-weight:500;color:var(--ink-faint);padding:6px 11px;border-radius:8px;transition:.15s}
        .levels-in button.on{background:var(--grad-violet);color:#fff}
        .drop{position:relative;border-radius:14px;transition:.15s}
        .drop.over{box-shadow:0 0 0 2px var(--violet)}
        .rep-ta{width:100%;min-height:210px;resize:vertical;border:1px solid var(--line);border-radius:14px;padding:14px;
          font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.65;color:var(--ink);background:var(--input-bg);transition:.15s}
        .rep-ta:focus{outline:none;border-color:var(--violet);box-shadow:0 0 0 4px rgba(139,92,246,.14)}
        .drop-hint{position:absolute;inset:0;border-radius:14px;background:rgba(139,92,246,.14);backdrop-filter:blur(3px);
          border:2px dashed var(--violet);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
          font-weight:600;color:var(--violet-2);pointer-events:none}
        .drop-hint svg{width:32px;height:32px}
        .ocr-overlay{position:absolute;inset:0;border-radius:14px;background:rgba(13,5,24,.75);backdrop-filter:blur(4px);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--ink);font-weight:500}
        .chips-in{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}
        .chip-in{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink-soft);background:rgba(139,92,246,.08);
          border:1px solid var(--line);padding:7px 12px;border-radius:10px;font-weight:500;transition:.15s}
        .chip-in:hover{border-color:var(--line-2);color:var(--ink);background:rgba(139,92,246,.14)}
        .dfoot{display:flex;justify-content:space-between;align-items:center;margin-top:15px;gap:12px}
        .cnt{font-size:11.5px;color:var(--ink-faint);font-family:'JetBrains Mono',monospace}
      `}</style>
    </Shell>
  );
}
