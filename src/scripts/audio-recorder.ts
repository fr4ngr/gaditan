// src/scripts/audio-recorder.ts

export class AudioRecorderManager {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private maxDurationMs = 60000; // 60 seconds limit
    private timerId: number | null = null;

    public onStart: () => void;
    public onStop: (audioBlob: Blob, audioUrl: string) => void;
    public onError: (err: any) => void;

    constructor(
        onStart: () => void,
        onStop: (audioBlob: Blob, audioUrl: string) => void,
        onError: (err: any) => void
    ) {
        this.onStart = onStart;
        this.onStop = onStop;
        this.onError = onError;
    }

    public async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                if (this.audioChunks.length === 0) return;
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                this.onStop(audioBlob, audioUrl);
                this.stopStream();
            };

            this.mediaRecorder.start();
            this.onStart();

            // Límite de tiempo automático
            this.timerId = window.setTimeout(() => {
                this.stopRecording();
            }, this.maxDurationMs);

        } catch (err) {
            console.error("Microphone error:", err);
            this.onError(err);
        }
    }

    public stopRecording() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    private stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    public isRecording() {
        return this.mediaRecorder?.state === 'recording';
    }
}
