export async function blobToAudioUrl(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}

export function revokeAudioUrl(url: string) {
  URL.revokeObjectURL(url);
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", (e) => {
      reject(e);
      URL.revokeObjectURL(url);
    });
  });
}

// Audio recording utility
export function createAudioRecorder(
  onData: (blob: Blob) => void,
  onStop: (blob: Blob) => void
) {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
        onData(e.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      onStop(blob);
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorder.start();
  }

  function stop() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  return { start, stop };
}
