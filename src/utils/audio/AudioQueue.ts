
export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    console.log('🎵 Adding audio to queue, size:', audioData.length);
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      console.log('🎵 Audio queue empty, stopping playback');
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    console.log('🎵 Playing audio chunk, size:', audioData.length);

    try {
      // Convert PCM16 to AudioBuffer
      const int16Array = new Int16Array(audioData.buffer);
      const float32Array = new Float32Array(int16Array.length);
      
      // Convert Int16 to Float32 with proper scaling
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        console.log('🎵 Audio chunk finished');
        this.playNext();
      };
      
      source.start(0);
      console.log('✅ Audio chunk started playing');
      
    } catch (error) {
      console.error('❌ Error playing audio chunk:', error);
      // Continue with next chunk even if current fails
      this.playNext();
    }
  }
}
