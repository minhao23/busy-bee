import audioConfig from "../types/audio";

type AudioKey = keyof typeof audioConfig;

class KeyNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KeyNotFoundError";
    }
}

class AudioManager {
    private audioMap = new Map<AudioKey, HTMLAudioElement>();
    
    private getAudio(key: AudioKey): HTMLAudioElement {
        if (this.audioMap.has(key)) {
            return this.audioMap.get(key)!;
        } else {
            throw new KeyNotFoundError("no audio found")
        }
    }

    init() {
        (Object.entries(audioConfig) as [AudioKey, string][]).forEach(([key, path]) => {
            // React remounts must reuse players so stop() never loses a playing element.
            if (this.audioMap.has(key)) return;
            const audio = new Audio(path);
            audio.preload = "auto";
            audio.load();
            this.audioMap.set(key, audio);
        });
    }

    play(key: AudioKey) {
        try {
            const audio = this.getAudio(key);
            audio.pause();
            audio.loop = false;
            audio.currentTime = 0;
            audio.play().catch((e) => console.error(`failed to play audio "${key}":`, e));
        } catch (err) {
            if (err instanceof KeyNotFoundError){
                console.error('key not found');
            }
        }
    }

    stop(key: AudioKey) {
        try {
            const audio = this.audioMap.get(key);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                audio.loop = false;
            }
        } catch (err) {
            if (err instanceof KeyNotFoundError) {
                console.error('key not found');
            }
        }
    }
}

const singleton = new AudioManager();
export default singleton;
