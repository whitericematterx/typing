
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypingArea } from './components/TypingArea';
import { StatsDisplay } from './components/StatsDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsIcon, RefreshCwIcon } from './components/Icons';
import { DEFAULT_SETTINGS, TEXT_SAMPLES } from './constants';
import type { Settings } from './types';
import { GameStatus } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<GameStatus>(GameStatus.WAITING);
  const [textToType, setTextToType] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const timerIntervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateText = useCallback(() => {
    const { mode, length, includePunctuation, includeNumbers } = settings.behavior;
    let samplePool = TEXT_SAMPLES.words;
    if (mode === 'quote') {
        samplePool = TEXT_SAMPLES.quotes;
    }
    
    let words: string[] = [];
    let targetWordCount: number;

    if (mode === 'time') {
        targetWordCount = 100; // Generate a longer text for time mode
    } else {
        targetWordCount = length;
    }

    while (words.length < targetWordCount) {
        const randomIndex = Math.floor(Math.random() * samplePool.length);
        words = words.concat(samplePool[randomIndex].split(' '));
    }

    words = words.slice(0, targetWordCount);

    if (includePunctuation) {
        for (let i = 0; i < words.length / 5; i++) {
            const wordIndex = Math.floor(Math.random() * words.length);
            const punctuation = ',.';
            words[wordIndex] += punctuation[Math.floor(Math.random() * punctuation.length)];
        }
    }

    if (includeNumbers) {
         for (let i = 0; i < words.length / 10; i++) {
            const wordIndex = Math.floor(Math.random() * words.length);
            words[wordIndex] = Math.floor(Math.random() * 1000).toString();
        }
    }
    
    setTextToType(words.join(' '));
  }, [settings.behavior]);

  const resetGame = useCallback(() => {
    setStatus(GameStatus.WAITING);
    setUserInput('');
    setErrors(0);
    setTimeElapsed(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    generateText();
    inputRef.current?.focus();
  }, [generateText]);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.behavior]);

  useEffect(() => {
    if (status === GameStatus.TYPING) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (settings.behavior.mode === 'time' && newTime >= settings.behavior.length) {
            setStatus(GameStatus.FINISHED);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [status, settings.behavior.mode, settings.behavior.length]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === GameStatus.FINISHED) return;

    if (status === GameStatus.WAITING) {
      setStatus(GameStatus.TYPING);
    }

    const value = e.target.value;
    
    const lastCharTyped = value.slice(-1);
    const correspondingChar = textToType[value.length - 1];

    if (lastCharTyped !== correspondingChar) {
        setErrors(prev => prev + 1);
    }

    setUserInput(value);

    if (value.length === textToType.length) {
      setStatus(GameStatus.FINISHED);
    }
  };
  
  const wpm = timeElapsed > 0 ? Math.round((userInput.length / 5) / (timeElapsed / 60)) : 0;
  const accuracy = userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : 100;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', settings.appearance.theme === 'dark');
    root.style.setProperty('--bg-color', settings.colors.background);
    root.style.setProperty('--text-color', settings.colors.text);
    root.style.setProperty('--correct-color', settings.colors.correct);
    root.style.setProperty('--incorrect-color', settings.colors.incorrect);
    root.style.setProperty('--caret-color', settings.colors.caret);
  }, [settings]);

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: settings.appearance.fontFamily,
        fontSize: `${settings.appearance.fontSize}px`,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">ZenType</h1>
          <StatsDisplay 
            status={status} 
            wpm={wpm} 
            accuracy={accuracy}
            time={settings.behavior.mode === 'time' ? settings.behavior.length - timeElapsed : timeElapsed}
          />
        </header>

        <main className="relative">
          {status === GameStatus.FINISHED && (
            <div className="absolute inset-0 bg-black/10 dark:bg-white/10 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center p-8 bg-[var(--bg-color)] rounded-lg shadow-2xl">
                <h2 className="text-3xl font-bold mb-2">Results</h2>
                <div className="flex space-x-8 text-xl">
                  <div>
                    <span className="font-bold text-[var(--correct-color)]">{wpm}</span> WPM
                  </div>
                  <div>
                    <span className="font-bold text-[var(--correct-color)]">{accuracy}%</span> Accuracy
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className={`${status === GameStatus.FINISHED ? 'blur-sm' : ''}`}>
             <TypingArea
                textToType={textToType}
                userInput={userInput}
                caretStyle={settings.appearance.caretStyle}
                isFocused={status !== GameStatus.FINISHED}
              />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default"
            autoFocus
            disabled={status === GameStatus.FINISHED}
          />
        </main>
        
        <footer className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={resetGame}
              className="p-3 rounded-full hover:bg-gray-500/20 transition-colors"
              aria-label="Restart Test"
            >
              <RefreshCwIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-3 rounded-full hover:bg-gray-500/20 transition-colors"
              aria-label="Open Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
        </footer>

        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          settings={settings}
          setSettings={setSettings}
        />
      </div>
    </div>
  );
};

export default App;
