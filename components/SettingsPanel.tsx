
import React from 'react';
import type { Settings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex justify-between items-center py-3">
    <label className="text-sm font-medium">{label}</label>
    <div className="flex items-center space-x-2">{children}</div>
  </div>
);

const CustomSelect = <T extends string,>({ value, options, onChange }: { value: T, options: T[], onChange: (value: T) => void }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as T)}
    className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--caret-color)]"
  >
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const CustomToggleButton: React.FC<{ isEnabled: boolean, onToggle: (value: boolean) => void}> = ({isEnabled, onToggle}) => (
  <button 
    onClick={() => onToggle(!isEnabled)}
    className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${isEnabled ? 'bg-[var(--correct-color)]' : 'bg-gray-400 dark:bg-gray-600'}`}
  >
    <span className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isEnabled ? 'translate-x-5' : 'translate-x-1'}`}/>
  </button>
);


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, setSettings }) => {
  if (!isOpen) return null;

  const handleAppearanceChange = <K extends keyof Settings['appearance']>(key: K, value: Settings['appearance'][K]) => {
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  };

  const handleColorsChange = <K extends keyof Settings['colors']>(key: K, value: Settings['colors'][K]) => {
    setSettings(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };
  
  const handleBehaviorChange = <K extends keyof Settings['behavior']>(key: K, value: Settings['behavior'][K]) => {
    if (key === 'mode') {
        const newLength = value === 'time' ? 30 : 25;
        setSettings(prev => ({ ...prev, behavior: { ...prev.behavior, [key]: value, length: newLength } }));
    } else {
        setSettings(prev => ({ ...prev, behavior: { ...prev.behavior, [key]: value } }));
    }
  };

  const colorKeys: (keyof Settings['colors'])[] = ['background', 'text', 'correct', 'incorrect', 'caret'];
  // FIX: Use `as const` to infer a tuple of literals instead of `number[]` to match `Settings['behavior']['length']` type.
  const timeLengths = [15, 30, 60, 120] as const;
  const wordLengths = [10, 25, 50, 100] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-20" onClick={onClose}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 rounded-lg shadow-2xl text-[var(--text-color)]"
        style={{ backgroundColor: 'var(--bg-color)'}}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Settings</h2>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="py-2">
            <h3 className="font-semibold mb-2">Appearance</h3>
            <SettingRow label="Theme">
              <CustomSelect
                  value={settings.appearance.theme}
                  options={['light', 'dark']}
                  onChange={value => handleAppearanceChange('theme', value)}
              />
            </SettingRow>
            <SettingRow label="Font Family">
               <CustomSelect
                  value={settings.appearance.fontFamily}
                  options={['monospace', 'sans-serif', 'serif']}
                  onChange={value => handleAppearanceChange('fontFamily', value)}
              />
            </SettingRow>
             <SettingRow label="Font Size">
               <input
                type="range"
                min="16"
                max="36"
                step="1"
                value={settings.appearance.fontSize}
                onChange={e => handleAppearanceChange('fontSize', parseInt(e.target.value))}
              />
            </SettingRow>
             <SettingRow label="Caret Style">
              <CustomSelect
                  value={settings.appearance.caretStyle}
                  options={['block', 'underline', 'box']}
                  onChange={value => handleAppearanceChange('caretStyle', value)}
              />
            </SettingRow>
          </div>
          
           <div className="py-2">
            <h3 className="font-semibold mb-2">Behavior</h3>
            <SettingRow label="Mode">
              <CustomSelect
                  value={settings.behavior.mode}
                  options={['time', 'words', 'quote']}
                  onChange={value => handleBehaviorChange('mode', value)}
              />
            </SettingRow>
            <SettingRow label={settings.behavior.mode === 'time' ? 'Time (s)' : 'Word Count'}>
              <div className="flex space-x-1">
                {(settings.behavior.mode === 'time' ? timeLengths : wordLengths).map(len => (
                  <button key={len} onClick={() => handleBehaviorChange('length', len)} className={`px-2 py-1 text-xs rounded-md ${settings.behavior.length === len ? 'bg-[var(--caret-color)] text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{len}</button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Punctuation">
              <CustomToggleButton isEnabled={settings.behavior.includePunctuation} onToggle={v => handleBehaviorChange('includePunctuation', v)} />
            </SettingRow>
            <SettingRow label="Numbers">
              <CustomToggleButton isEnabled={settings.behavior.includeNumbers} onToggle={v => handleBehaviorChange('includeNumbers', v)} />
            </SettingRow>
          </div>
          
          <div className="py-2">
            <h3 className="font-semibold mb-2">Colors</h3>
            {colorKeys.map(key => (
              <SettingRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <input
                  type="color"
                  value={settings.colors[key]}
                  onChange={e => handleColorsChange(key, e.target.value)}
                  className="w-8 h-8 p-0 border-none bg-transparent"
                />
              </SettingRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
