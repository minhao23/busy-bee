import audioConfig from "../types/audio";

type AudioKey = keyof typeof audioConfig;

class AudioManager {
    private audioMap = new Map<AudioKey, HTMLAudioElement>();
    
    private getAudio(key: AudioKey): HTMLAudioElement {
        if (this.audioMap.has(key)) {
            return this.audioMap.get(key)!;
        }
        const audio = new Audio(audioConfig[key]);
        audio.preload = "auto";
        this.audioMap.set(key, audio);
        return audio;
    }

    play(key: AudioKey, loop = false) {
        const audio = this.getAudio(key);
        audio.loop = loop;
        audio.currentTime = 0;
        audio.play().catch((e) => console.error(`failed to play audio "${key}":`, e));
    }

    stop(key: AudioKey) {
        const audio = this.audioMap.get(key);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.loop = false;
        }
    }
}

const singleton = new AudioManager();
export default singleton;