declare module "react-speech-recognition" {
  export interface ListenerOptions {
    continuous?: boolean;
    language?: string;
  }

  export interface SpeechRecognitionInstance {
    startListening: (options?: ListenerOptions) => Promise<void>;
    stopListening: () => Promise<void>;
  }

  export interface UseSpeechRecognitionReturn {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    browserSupportsSpeechRecognition: boolean;
    browserSupportsContinuousListening: boolean;
    isMicrophoneAvailable: boolean;
    resetTranscript: () => void;
  }

  const SpeechRecognition: SpeechRecognitionInstance;

  export function useSpeechRecognition(): UseSpeechRecognitionReturn;

  export type SpeechRecognitionType = SpeechRecognitionInstance;

  export default SpeechRecognition;
}
