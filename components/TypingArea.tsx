
import React, { useMemo } from 'react';
import type { CaretStyle } from '../types';

interface TypingAreaProps {
  textToType: string;
  userInput: string;
  caretStyle: CaretStyle;
  isFocused: boolean;
}

const Caret: React.FC<{ style: CaretStyle; isVisible: boolean }> = React.memo(({ style, isVisible }) => {
  if (!isVisible) return null;

  const baseClasses = 'absolute animate-blink';
  let styleClasses = '';
  switch (style) {
    case 'block':
      styleClasses = 'w-[2px] h-full -translate-x-1/2';
      break;
    case 'underline':
      styleClasses = 'w-full h-[2px] bottom-0';
      break;
    case 'box':
      styleClasses = 'w-full h-full border-2 rounded-sm';
      break;
  }

  return <div className={`${baseClasses} ${styleClasses}`} style={{ backgroundColor: style === 'underline' || style === 'block' ? 'var(--caret-color)' : 'transparent', borderColor: style === 'box' ? 'var(--caret-color)' : 'transparent' }}></div>;
});
Caret.displayName = "Caret";


export const TypingArea: React.FC<TypingAreaProps> = ({ textToType, userInput, caretStyle, isFocused }) => {

  const characters = useMemo(() => {
    return textToType.split('').map((char, index) => {
      const isTyped = index < userInput.length;
      let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';

      if (isTyped) {
        state = userInput[index] === char ? 'correct' : 'incorrect';
      }

      return {
        char,
        state,
      };
    });
  }, [textToType, userInput]);

  return (
    <div className="relative leading-relaxed tracking-wider text-2xl text-left p-4 rounded-lg bg-gray-500/10">
      {characters.map(({ char, state }, index) => (
        <span key={index} className="relative">
          {index === userInput.length && <Caret style={caretStyle} isVisible={isFocused} />}
          <span
            style={{
              color: state === 'correct' ? 'var(--correct-color)' : state === 'incorrect' ? 'var(--incorrect-color)' : 'inherit',
              textDecoration: state === 'incorrect' && char === ' ' ? 'underline' : 'none'
            }}
          >
            {char}
          </span>
        </span>
      ))}
       {userInput.length === textToType.length && <Caret style={caretStyle} isVisible={isFocused} />}
    </div>
  );
};
