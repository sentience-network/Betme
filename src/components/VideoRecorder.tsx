"use client";

import { useRef, useState } from "react";

interface Props {
  onUploaded: (url: string) => void;
}

// Records a short video message via the browser's MediaRecorder API, with a
// file-picker fallback for environments without camera access. The captured
// blob is uploaded to /api/upload and the resulting URL is returned.
export function VideoRecorder({ onUploaded }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        await upload(blob, "message.webm");
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Camera unavailable — use “Upload a video file” instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function upload(blob: Blob, filename: string) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", blob, filename);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-700 p-3">
      <video ref={videoRef} muted playsInline className="w-full rounded-md bg-black" style={{ maxHeight: 180 }} />
      <div className="flex flex-wrap gap-2">
        {!recording ? (
          <button type="button" onClick={startRecording} className="btn-ghost" data-testid="record-start">
            ● Record
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="btn bg-rose-600 text-white" data-testid="record-stop">
            ■ Stop &amp; send
          </button>
        )}
        <label className="btn-ghost cursor-pointer">
          Upload a video file
          <input
            type="file"
            accept="video/*"
            className="hidden"
            data-testid="video-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f, f.name);
            }}
          />
        </label>
      </div>
      {uploading && <p className="text-sm text-slate-400">Uploading…</p>}
      {error && <p className="text-sm text-amber-400">{error}</p>}
    </div>
  );
}
