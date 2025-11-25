
export enum GameStatus {
  WAITING,
  TYPING,
  FINISHED,
}

export type CaretStyle = 'block' | 'underline' | 'box';
export type Theme = 'light' | 'dark';
export type FontFamily = 'monospace' | 'sans-serif' | 'serif';
export type TestMode = 'time' | 'words' | 'quote';

export interface Settings {
  appearance: {
    theme: Theme;
    fontFamily: FontFamily;
    fontSize: number;
    caretStyle: CaretStyle;
  };
  colors: {
    background: string;
    text: string;
    correct: string;
    incorrect: string;
    caret: string;
  };
  behavior: {
    mode: TestMode;
    length: 10 | 15 | 25 | 30 | 50 | 60 | 100 | 120;
    includePunctuation: boolean;
    includeNumbers: boolean;
  }
}
