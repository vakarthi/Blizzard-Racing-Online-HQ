import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useAuth';
import { userService } from '../services/userService';
import type { Theme, ThemeColors } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

type ActiveTab = 'password' | 'theme';

const PasswordTab: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { user } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback({ message: '', type: '' });
        if (newPassword !== confirmPassword) {
            setFeedback({ message: 'New passwords do not match.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setFeedback({ message: 'New password must be at least 6 characters long.', type: 'error' });
            return;
        }
        if (!user) return;
        setIsLoading(true);
        const result = userService.changePassword(user.email, oldPassword, newPassword);
        setIsLoading(false);
        setFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
        if (result.success) {
            setTimeout(() => { onClose(); }, 1500);
        }
    };

    if (user?.email === 'shrivatsakarth.kart@saintolaves.net') {
        return (
            <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-text-primary">Password Change Unavailable</h3>
                <p className="text-text-secondary">For security reasons, the default manager's password cannot be changed via this panel.</p>
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="current-password-modal" className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                <input id="current-password-modal" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
            </div>
            <div>
                <label htmlFor="new-password-modal" className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                <input id="new-password-modal" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
            </div>
            <div>
                <label htmlFor="confirm-password-modal" className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                <input id="confirm-password-modal" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
            </div>
            {feedback.message && (<p className={`text-sm text-center ${feedback.type === 'success' ? 'text-success' : 'text-danger'}`}>{feedback.message}</p>)}
            <div className="flex justify-end pt-2">
                <button type="button" onClick={onClose} className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg transition-colors mr-2">Cancel</button>
                <button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </form>
    );
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)})` : null;
};
const rgbToHex = (rgb: string) => {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return "#" + result.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
};

const ThemeEditor: React.FC<{ existingTheme?: Theme, onSave: (theme: Theme) => void, onCancel: () => void }> = ({ existingTheme, onSave, onCancel }) => {
    const [name, setName] = useState(existingTheme?.name || '');
    const { theme: currentTheme } = useTheme();
    const [colors, setColors] = useState<ThemeColors>(existingTheme?.colors || currentTheme.colors);
    const [bgUrl, setBgUrl] = useState(existingTheme?.backgroundImageUrl || '');
    
    const handleSave = () => {
        onSave({ name, colors, isCustom: true, backgroundImageUrl: bgUrl });
    };

    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        const rgbValue = hexToRgb(value);
        if (rgbValue) {
            setColors(prev => ({ ...prev, [key]: rgbValue }));
        }
    };

    const colorFields: { key: keyof ThemeColors, label: string }[] = [
        { key: '--color-primary', label: 'Primary Action' }, { key: '--color-accent', label: 'Accent / Highlight' },
        { key: '--color-background-primary', label: 'Main Background' }, { key: '--color-background-secondary', label: 'Card Background' },
        { key: '--color-text-primary', label: 'Primary Text' }, { key: '--color-text-secondary', label: 'Secondary Text' },
    ];

    return (
        <div className="bg-background-primary p-4 rounded-lg border border-accent/20">
            <h4 className="text-lg font-bold text-text-primary mb-4">{existingTheme ? 'Edit Theme' : 'Create New Theme'}</h4>
            <div className="space-y-4">
                <input type="text" placeholder="Theme Name" value={name} onChange={e => setName(e.target.value)} disabled={!!existingTheme} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent disabled:opacity-50" />
                <input type="text" placeholder="Background Image URL (optional)" value={bgUrl} onChange={e => setBgUrl(e.target.value)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                <div className="grid grid-cols-2 gap-4">
                    {colorFields.map(({ key, label }) => (
                         <div key={key}>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
                            <div className="flex items-center bg-background-tertiary rounded border border-border-color">
                                <input type="color" value={rgbToHex(colors[key])} onChange={e => handleColorChange(key, e.target.value)} className="w-8 h-8 p-1 bg-transparent border-0 cursor-pointer" />
                                <span className="px-2 text-sm text-text-secondary">{rgbToHex(colors[key])}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-3 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-3 rounded-lg transition-colors">Save Theme</button>
                </div>
            </div>
        </div>
    );
};


const PersonalizationTab: React.FC = () => {
    const { theme, themes, applyTheme, saveCustomTheme, deleteCustomTheme } = useTheme();
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined);

    const handleSave = (newTheme: Theme) => {
        saveCustomTheme(newTheme);
        setEditorOpen(false);
        setEditingTheme(undefined);
    };

    const handleEdit = (themeToEdit: Theme) => {
        setEditingTheme(themeToEdit);
        setEditorOpen(true);
    };

    return (
        <div className="space-y-6">
            {editorOpen ? (
                <ThemeEditor existingTheme={editingTheme} onSave={handleSave} onCancel={() => { setEditorOpen(false); setEditingTheme(undefined); }} />
            ) : (
                <>
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-text-primary">Select Theme</h3>
                        <button onClick={() => setEditorOpen(true)} className="bg-primary hover:bg-primary-hover text-text-on-primary text-sm font-bold py-1 px-3 rounded-lg transition-colors">Create New</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {themes.map(t => (
                            <div key={t.name} className={`p-3 rounded-lg border-2 cursor-pointer transition-all transform ${theme.name === t.name ? 'border-accent shadow-lg' : 'border-border-color hover:border-text-secondary/50 hover:shadow-md'} hover:scale-105`} onClick={() => applyTheme(t.name)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-text-primary">{t.name}</h4>
                                        {t.isCustom && <span className="text-xs text-text-secondary">Custom</span>}
                                    </div>
                                    <div className="flex space-x-2">
                                        {t.isCustom && (<button onClick={(e) => { e.stopPropagation(); handleEdit(t);}} className="text-text-secondary hover:text-accent text-xs">Edit</button>)}
                                        {t.isCustom && (<button onClick={(e) => { e.stopPropagation(); deleteCustomTheme(t.name);}} className="text-text-secondary hover:text-danger text-xs">Delete</button>)}
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.colors['--color-background-secondary'] }}></div>
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.colors['--color-primary'] }}></div>
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.colors['--color-accent'] }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}
        </div>
    );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('password');

  return (
    <div className="fixed inset-0 bg-background-primary/75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
      <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-lg border border-border-color modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        <div className="border-b border-border-color px-4">
            <nav className="flex space-x-2 -mb-px">
                <button onClick={() => setActiveTab('password')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'password' ? 'text-accent border-accent' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>Change Password</button>
                <button onClick={() => setActiveTab('theme')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'theme' ? 'text-accent border-accent' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>Personalization</button>
            </nav>
        </div>
        <div className="p-6">
            {activeTab === 'password' && <PasswordTab onClose={onClose} />}
            {activeTab === 'theme' && <PersonalizationTab />}
        </div>
      </div>
    </div>
  );
};