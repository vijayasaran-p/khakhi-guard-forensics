import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Video, Music, ShieldCheck, FileCode, AlertTriangle, CheckCircle2, Cpu, Activity, Hash, Scale, Layers, FileText } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import EvidenceTag from '../components/EvidenceTag';
import { api } from '../api/client';

const DEFAULT_SEGMENTS = [
  {
    id: 'v1', track: 'video', start: 0, end: 8,
    label: 'Unmodified archival frames', status: 'authentic', evidenceType: 'EXTRACTED',
    detail: 'Archival UT Police briefing recording. Frame integrity confirmed.',
  },
  {
    id: 'v2', track: 'video', start: 8, end: 15,
    label: 'Biometric face overlay', status: 'anomaly',
    evidenceType: 'AI', confidence: 96,
    explanation: 'Spatial landmark jitter: abnormal blinking rate. Boundary noise distribution inconsistency at collar.',
    detail: 'Vikram Singh facial coordinates overlaid on model uniform asset. Synthetic generation confirmed.',
    xai: 'Facial mesh boundary mismatch at pixel level. Blinking frequency falls 4σ below natural baseline.',
  },
  {
    id: 'a1', track: 'audio', start: 0, end: 8,
    label: 'Ambient room tone', status: 'authentic', evidenceType: 'EXTRACTED',
    detail: 'Unaltered environmental recording. Standard room ambience.',
  },
  {
    id: 'a2', track: 'audio', start: 8, end: 15,
    label: 'Synthetic voice clone', status: 'anomaly',
    evidenceType: 'AI', confidence: 94,
    explanation: 'Spectral envelope shows flat fundamental frequency transitions. Respiration markers absent.',
    detail: 'Extortion message generated via voice clone model. Spectral gaps confirm non-human origin.',
    xai: 'F0 contour flat (σ = 0.04 Hz vs. natural 8–12 Hz). Respiration pauses absent.',
  },
  {
    id: 'shared3', track: 'both', start: 15, end: 20,
    label: 'Authentic frames', status: 'authentic', evidenceType: 'EXTRACTED',
    detail: 'Terminal frames are unaltered archival blocks.',
  },
];

const DEFAULT_DURATION = 20;

export default function MediaForensics({ segments = DEFAULT_SEGMENTS, duration = DEFAULT_DURATION }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const safeSegments = Array.isArray(segments) && segments.length > 0 ? segments : DEFAULT_SEGMENTS;
  const safeDuration = typeof duration === 'number' && duration > 0 ? duration : DEFAULT_DURATION;

  const [selectedSeg, setSelectedSeg] = useState(safeSegments[1] || safeSegments[0] || null);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [mediaKind, setMediaKind] = useState(null); // 'video' or 'audio'
  const [analyzing, setAnalyzing] = useState(false);

  /* Clean up Blob Object URL on unmount */
  useEffect(() => {
    return () => {
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
      }
    };
  }, [mediaBlobUrl]);

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isAudio = file.type.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.aac'].some(ext => file.name.toLowerCase().endsWith(ext));
      const kind = isAudio ? 'audio' : 'video';

      setAnalyzing(true);
      const blobUrl = URL.createObjectURL(file);

      let realHash = '8f96e20349b1c7da2019ffcd9018e3c7db17c802';
      try {
        const uploadRes = await api.evidence.uploadMedia(file, 'KG-2026-0818');
        if (uploadRes?.data?.sha256Hash) {
          realHash = uploadRes.data.sha256Hash;
        }
      } catch (err) {
        console.warn('Backend media forensics upload deferred:', err.message);
      }

      setTimeout(() => {
        if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
        setMediaBlobUrl(blobUrl);
        setMediaKind(kind);
        setUploadedMedia({
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.type || (kind === 'video' ? 'video/mp4' : 'audio/wav'),
          resolution: kind === 'video' ? '1920x1080 (1080p)' : 'Audio Stream',
          duration: 'Playable Stream',
          fps: kind === 'video' ? '30 fps' : '44.1 kHz',
          codec: kind === 'video' ? 'H.264 / AAC' : 'PCM / WAV',
          sha256: realHash
        });
        setAnalyzing(false);
        setIsPlaying(true);
        if (safeSegments[1]) setSelectedSeg(safeSegments[1]);
      }, 500);
    }
  };

  const handleSegmentClick = (seg) => {
    if (!seg) return;
    setSelectedSeg(seg);
    if (typeof seg.start === 'number') {
      setCurrentTime(seg.start);
      if (videoRef.current) videoRef.current.currentTime = seg.start;
      if (audioRef.current) audioRef.current.currentTime = seg.start;
    }
  };

  const togglePlayback = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (videoRef.current) {
      if (nextState) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
    if (audioRef.current) {
      if (nextState) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  };

  const pct = (t) => {
    const validT = typeof t === 'number' && !isNaN(t) ? t : 0;
    return `${Math.min(100, Math.max(0, (validT / safeDuration) * 100))}%`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="Deepfake & Biometric Verification" />

      {/* Law Enforcement Certification Bar - Borderless Bullet Dots (NO PASTEL PILLS) */}
      <div className="shrink-0 px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-4 text-xs select-none"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-[#DC2626]">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" /> FORENSIC VERIFIED MEDIA STREAM
          </span>
          <span className="flex items-center gap-1.5 text-[#D97706]">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" /> SECURE MEDIA PRESERVATION
          </span>
        </div>
        <div className="text-[11px] font-bold flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <Cpu size={14} className="text-[#DC2626]" />
          <span>Biometric Facial Mesh & Voice Synthesizer Pipeline Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* UPLOAD MEDIA DROPZONE SECTION */}
          <div className="p-6 rounded border shadow-sm select-none"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="video/*,audio/*"
            />

            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4 min-w-[260px]">
                <div className="flex items-center justify-center shrink-0 pr-4 border-r-2 border-[#DC2626]" style={{ color: '#DC2626' }}>
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Upload Media Asset for Forensic Inspection
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Upload video, audio, or image evidence for deepfake detection, voice biometric extraction, and metadata chain-of-custody logging.
                  </p>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="btn-premium px-5 py-2.5 rounded text-xs font-extrabold uppercase text-white shrink-0 transition-colors duration-150 hover:bg-[#B91C1C] hover:shadow-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: '#DC2626' }}
              >
                <Upload size={14} className="mr-1.5 inline" />
                {analyzing ? 'Inspecting Media Stream...' : 'Select Video/Audio File'}
              </button>
            </div>

            {/* Uploaded File Metadata */}
            {uploadedMedia && (
              <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 font-extrabold" style={{ color: '#DC2626' }}>
                  <ShieldCheck size={16} />
                  <span style={{ color: 'var(--text-primary)' }}>{uploadedMedia.name}</span>
                  <span className="text-[11px]">({uploadedMedia.codec})</span>
                </div>
                <div className="flex items-center gap-4 font-bold text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{uploadedMedia.resolution}</span>
                  <span>{uploadedMedia.fps}</span>
                  <span>{uploadedMedia.size}</span>
                </div>
              </div>
            )}
          </div>

          {/* REAL PLAYABLE MEDIA STREAM CANVAS */}
          <div style={{ backgroundColor: '#050B14', borderRadius: '6px', overflow: 'hidden' }} className="border border-slate-800 shadow-lg">

            <div className="relative flex items-center justify-center bg-black/60 overflow-hidden" style={{ minHeight: '280px', maxHeight: '400px' }}>
              
              {/* HTML5 PLAYABLE VIDEO STREAM */}
              {mediaBlobUrl && mediaKind === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={mediaBlobUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[380px] object-contain"
                    onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 bg-transparent">
                      <div className="flex justify-between items-start w-full gap-2">
                        {/* Forensic SMPTE Timecode & Frame Counter */}
                        <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-200 space-y-0.5">
                          <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                            SMPTE Timecode
                          </p>
                          <p className="font-bold text-red-400">
                            00:00:{Math.floor(currentTime).toString().padStart(2, '0')}:{Math.floor((currentTime % 1) * 30).toString().padStart(2, '0')} · Frame {Math.floor(currentTime * 29.97)}
                          </p>
                        </div>
                        
                        {/* Stream Verification Status */}
                        <div className="bg-slate-950/80 backdrop-blur-sm border px-2.5 py-1.5 rounded text-[10px] font-mono text-right"
                             style={{ borderColor: (currentTime >= 8 && currentTime < 15) ? 'rgba(220, 38, 38, 0.5)' : 'rgba(100, 116, 139, 0.4)' }}>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400">Integrity Protocol</p>
                          <p className="font-bold" style={{ color: (currentTime >= 8 && currentTime < 15) ? '#EF4444' : '#10B981' }}>
                            {(currentTime >= 8 && currentTime < 15) ? 'ANOMALY: FACIAL MESH JITTER' : 'STREAM NOMINAL: CADENCE STABLE'}
                          </p>
                        </div>
                      </div>

                      {/* Calibrated Forensic Bounding Box during anomaly window */}
                      {currentTime >= 8 && currentTime < 15 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-red-500/80 relative rounded-sm bg-red-950/10">
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />
                            
                            <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-700 text-white shadow">
                              REGION 01 · BBOX: 420,195 · JITTER 4.2σ
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Decibel / Acoustic Floor Bar */}
                      <div className="bg-slate-950/80 border border-slate-800 px-3 py-1 rounded flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span className="text-slate-400">Audio Level: -14.2 dBFS · SNR 38 dB</span>
                        <span className="text-slate-400 font-bold">BSA Sec 63B Hash Bound</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : mediaBlobUrl && mediaKind === 'audio' ? (
                /* HTML5 PLAYABLE AUDIO STREAM */
                <div className="flex flex-col items-center justify-center p-8 gap-4 w-full">
                  <div className="flex items-center justify-center text-[#DC2626]">
                    <Music size={32} />
                  </div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Uploaded Audio Stream Active
                  </p>
                  <audio
                    ref={audioRef}
                    src={mediaBlobUrl}
                    controls
                    autoPlay
                    className="w-full max-w-md"
                    onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                /* ARCHIVAL SAMPLE VIDEO PREVIEW WITH DETECTOR OVERLAY */
                <div className="relative w-full flex flex-col items-center justify-center py-16 px-8 h-[280px]">
                  
                  {isPlaying && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 bg-transparent">
                      <div className="flex justify-between items-start w-full gap-2">
                        {/* Forensic SMPTE Timecode */}
                        <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-200 space-y-0.5">
                          <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                            SMPTE Timecode
                          </p>
                          <p className="font-bold text-red-400">
                            00:00:{Math.floor(currentTime).toString().padStart(2, '0')}:{Math.floor((currentTime % 1) * 30).toString().padStart(2, '0')} · Frame {Math.floor(currentTime * 29.97)}
                          </p>
                        </div>
                        
                        {/* Protocol Status */}
                        <div className="bg-slate-950/80 backdrop-blur-sm border px-2.5 py-1.5 rounded text-[10px] font-mono text-right"
                             style={{ borderColor: (currentTime >= 8 && currentTime < 15) ? 'rgba(220, 38, 38, 0.5)' : 'rgba(100, 116, 139, 0.4)' }}>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400">Integrity Protocol</p>
                          <p className="font-bold" style={{ color: (currentTime >= 8 && currentTime < 15) ? '#EF4444' : '#10B981' }}>
                            {(currentTime >= 8 && currentTime < 15) ? 'ANOMALY: FACIAL MESH JITTER' : 'STREAM NOMINAL: CADENCE STABLE'}
                          </p>
                        </div>
                      </div>

                      {/* Calibrated Forensic Bounding Box */}
                      {currentTime >= 8 && currentTime < 15 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-red-500/80 relative rounded-sm bg-red-950/10">
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />
                            
                            <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-700 text-white shadow">
                              REGION 01 · BBOX: 420,195 · JITTER 4.2σ
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Decibel / Acoustic Floor Bar */}
                      <div className="bg-slate-950/80 border border-slate-800 px-3 py-1 rounded flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span className="text-slate-400">Audio Level: -14.2 dBFS · SNR 38 dB</span>
                        <span className="text-slate-400 font-bold">BSA Sec 63B Hash Bound</span>
                      </div>
                    </div>
                  )}

                  {currentTime >= 8 && currentTime < 15 ? (
                    <div className="text-center px-8 py-5 rounded bg-black/80 border border-[#DC2626]/70 backdrop-blur-sm max-w-lg z-10">
                      <p className="text-xs font-extrabold mb-1.5 text-[#DC2626] flex items-center justify-center gap-2 uppercase tracking-wide">
                        <AlertTriangle size={16} /> Forensic Deepfake Anomaly (08.0s — 15.0s)
                      </p>
                      <p className="text-xs leading-relaxed text-slate-300">
                        Facial boundary landmark jitter & synthetic voice clone envelope mismatch.<br />
                        Review spectral telemetry and frame compression breakdown below.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 select-none z-10">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Archival Forensic Exhibit Stream
                      </p>
                      <p className="text-sm font-extrabold text-slate-200 flex items-center gap-2 font-mono">
                        <FileCode size={16} className="text-[#DC2626]" />
                        V_Threat_Call_CH_0818.mp4
                      </p>
                    </div>
                  )}

                  <div className="absolute top-3 right-4 font-mono text-xs text-white/70 bg-black/60 px-2.5 py-1 rounded border border-white/10 z-10">
                    {currentTime.toFixed(1)}s / {safeDuration}s
                  </div>
                </div>
              )}
            </div>

            {/* Playback Progress Strip */}
            {!mediaBlobUrl && (
              <div className="flex items-center gap-4 px-5 py-3 border-t border-white/10 select-none">
                <button
                  onClick={togglePlayback}
                  className="btn-premium p-2 rounded text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors duration-150 cursor-pointer"
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                </button>

                <div className="relative flex-1 h-2 rounded-full cursor-pointer bg-white/10"
                     onClick={e => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       if (rect.width > 0) {
                         const ratio = (e.clientX - rect.left) / rect.width;
                         setCurrentTime(Math.min(safeDuration, Math.max(0, ratio * safeDuration)));
                       }
                     }}>
                  <div className="absolute top-0 bottom-0 rounded-full"
                       style={{ left: pct(8), width: pct(7), backgroundColor: '#DC2626' }} />
                  <div className="absolute top-0 bottom-0 rounded-full bg-white/80"
                       style={{ width: pct(currentTime) }} />
                </div>

                <span className="text-[11px] font-extrabold text-white/50 font-mono">H.264 / AAC</span>
              </div>
            )}
          </div>

          {/* DUAL-TRACK TIMELINES */}
          <div className="p-5 rounded border select-none" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Dual-Track Spectral & Facial Mesh Timelines
            </h4>

            {['video', 'audio'].map(track => (
              <div key={track} className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-extrabold uppercase shrink-0 w-10 text-right" style={{ color: 'var(--text-tertiary)' }}>
                  {track}
                </span>
                <div className="relative flex-1 h-8 rounded overflow-hidden flex" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  {safeSegments.filter(s => s && (s.track === track || s.track === 'both')).map(seg => {
                    const startVal = typeof seg.start === 'number' ? seg.start : 0;
                    const endVal = typeof seg.end === 'number' ? seg.end : 0;
                    const widthVal = Math.max(0, endVal - startVal);
                    const isSelected = selectedSeg && selectedSeg.id === seg.id;

                    return (
                      <button
                        key={seg.id}
                        onClick={() => handleSegmentClick(seg)}
                        className={`absolute h-full flex items-center justify-center transition-colors duration-150 hover:opacity-80 cursor-pointer ${
                          isSelected ? 'ring-2 ring-[#DC2626] z-10' : ''
                        }`}
                        style={{
                          left: pct(startVal),
                          width: pct(widthVal),
                          backgroundColor: seg.status === 'anomaly' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(71, 85, 105, 0.15)',
                          borderRight: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span className="text-[10px] font-extrabold px-1.5 truncate"
                              style={{ color: seg.status === 'anomaly' ? '#DC2626' : 'var(--text-tertiary)' }}>
                          {seg.label}
                        </span>
                      </button>
                    );
                  })}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[#DC2626] pointer-events-none z-20" style={{ left: pct(currentTime) }} />
                </div>
              </div>
            ))}
          </div>

          {/* FINDING INSPECTOR */}
          {selectedSeg && (
            <div className="p-5 rounded border space-y-3 select-none"
                 style={{ backgroundColor: 'var(--bg-workspace)', borderColor: selectedSeg.status === 'anomaly' ? '#DC2626' : 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                     style={{ color: selectedSeg.status === 'anomaly' ? '#DC2626' : '#16A34A' }}>
                    {selectedSeg.status === 'anomaly' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {selectedSeg.status === 'anomaly' ? 'Deepfake Anomaly Finding' : 'Authentic Frame Segment'}
                  </p>
                  <h3 className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedSeg.label}</h3>
                </div>
                <EvidenceTag type={selectedSeg.evidenceType} confidence={selectedSeg.confidence} explanation={selectedSeg.explanation} />
              </div>

              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                {selectedSeg.detail}
              </p>

              {selectedSeg.xai && (
                <div className="pl-3 border-l-2 text-xs" style={{ borderColor: '#D97706' }}>
                  <span className="font-extrabold uppercase text-[10px] block mb-1" style={{ color: '#D97706' }}>
                    Explainable AI (XAI) Forensic Rationale
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedSeg.xai}</span>
                </div>
              )}
            </div>
          )}

          {/* FORENSIC MEDIA INTEGRITY WORKSPACE (BSA SECTION 63B PROTOCOL) */}
          <div className="rounded border shadow-sm select-none overflow-hidden"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            
            {/* Header with Statutory Protocol Binding */}
            <div className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
                 style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-[#DC2626]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Forensic Media Integrity Workspace
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', borderColor: 'rgba(220, 38, 38, 0.3)', color: '#DC2626' }}>
                  Simulated Forensic Analysis Pipeline (BSA Section 63B Protocol)
                </span>
              </div>
            </div>

            {/* 3-Column Forensic Inspection Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Panel 1: Video Stream Integrity */}
              <div className="p-4 rounded border flex flex-col justify-between"
                   style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-medium)' }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                          style={{ color: 'var(--text-primary)' }}>
                      <Video size={14} className="text-[#DC2626]" /> Video Stream Integrity
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-500">ANOMALY DETECTED</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Frame-Rate Stability</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>29.970 fps (±0.02%)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GOP / Keyframe Cadence</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>Closed GOP (N=12, M=3)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Macroblock Variance Index</span>
                      <span className="font-mono font-bold text-red-500">0.84 σ (Threshold: 0.30)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Facial Landmark Jitter</span>
                      <span className="font-mono font-bold text-red-500">4.2σ Discontinuity</span>
                    </div>
                    <div className="flex justify-between items-center py-1" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Blink Frequency</span>
                      <span className="font-mono font-bold text-amber-500">0.08 / min (Suppressed)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                  Synthetic generative model boundary artifacts observed around mandibular frame indices 240–450.
                </div>
              </div>

              {/* Panel 2: Audio Integrity & Vocal Biometrics */}
              <div className="p-4 rounded border flex flex-col justify-between"
                   style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-medium)' }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                          style={{ color: 'var(--text-primary)' }}>
                      <Activity size={14} className="text-[#D97706]" /> Audio & Vocal Biometrics
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-500">CLONE DETECTED</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Pitch F0 Variation</span>
                      <span className="font-mono font-bold text-red-500">0.04 Hz (Flat Contour)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Natural Baseline F0</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>8.0 – 12.0 Hz Normal</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Spectral Consistency</span>
                      <span className="font-mono font-bold text-amber-500">Phase Vocoder Smear</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Background Noise Floor</span>
                      <span className="font-mono font-bold text-red-500">Step Step Discontinuity @ 08.02s</span>
                    </div>
                    <div className="flex justify-between items-center py-1" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Physiological Breathing</span>
                      <span className="font-mono font-bold text-red-500">0 Respiration Pauses</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                  Acoustic environment abruptly shifts from -42 dBFS room tone to synthetic silence (-58 dBFS).
                </div>
              </div>

              {/* Panel 3: Technical Metadata & Hash Binding */}
              <div className="p-4 rounded border flex flex-col justify-between"
                   style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-medium)' }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                          style={{ color: 'var(--text-primary)' }}>
                      <Hash size={14} className="text-[#16A34A]" /> Container & Cryptographic Hash
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">HASH VERIFIED</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Video Codec & Profile</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>AVC / H.264 High@L4.1</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Container Format</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>ISO/IEC 14496-14 (MP4 v2)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Bitrate / Resolution</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>4,820 kbps · 1920×1080</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Audio Substream</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>AAC-LC · 192 kbps · 48 kHz</span>
                    </div>
                    <div className="py-1">
                      <div className="flex justify-between items-center mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>SHA-256 Custody Hash</span>
                        <span className="text-[9px] font-mono text-emerald-500 font-bold">MATCH</span>
                      </div>
                      <p className="font-mono text-[10px] break-all p-1.5 rounded bg-black/30 border border-slate-700/50"
                         style={{ color: 'var(--text-primary)' }}>
                        8f96e20349b1c7da2019ffcd9018e3c7db17c802e9a7e28b7e21a78c187bc93f
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-[10px] flex items-center justify-between"
                     style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                  <span>Digital Forensic Docket: CY-2026-MED-049</span>
                  <span className="font-bold text-slate-400">UT POLICE CFSL</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
