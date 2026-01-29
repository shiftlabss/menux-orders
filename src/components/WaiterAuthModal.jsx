import React, { useState, useRef, useEffect } from 'react';
import './WaiterAuthModal.css';

const PinInput = ({ length = 4, value, onChange, type = "text", autoFocus = false }) => {
    const inputs = useRef([]);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return; // Only allow numbers

        const newChar = val.slice(-1); // Take the last character entered
        const newValue = value.split('');
        newValue[index] = newChar;
        const newStr = newValue.join('');

        onChange(newStr);

        // Move to next input if we entered a character
        if (newChar && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // If empty and backspace, move previous
                inputs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/[^\d]/g, '');
        if (pastedData) {
            onChange(pastedData.padEnd(length, '').slice(0, length));
            // Focus last filled or last input
            const nextFocus = Math.min(pastedData.length, length - 1);
            inputs.current[nextFocus]?.focus();
        }
    };

    return (
        <div className="pin-input-group">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type={type === 'password' ? 'password' : 'text'}
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    className="pin-box"
                    autoFocus={autoFocus && i === 0}
                />
            ))}
        </div>
    );
};

export const WaiterAuthModal = ({ isOpen, onClose, onConfirm, title = "Autorização Necessária" }) => {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirmClick = async () => {
        // Basic validation roughly
        if (code.length < 4 || password.length < 4) {
            setError('Preencha os campos completos.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await onConfirm(code, password);
        } catch (err) {
            setError('Código ou senha inválidos');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="waiter-auth-overlay" onClick={onClose}>
            <div className="waiter-auth-modal" onClick={e => e.stopPropagation()}>

                <div className="waiter-auth-content">

                    <div className="auth-row">
                        <div className="auth-field-group">
                            <label>Seu ID Garçom</label>
                            <PinInput
                                length={4}
                                value={code}
                                onChange={setCode}
                                autoFocus={true}
                            />
                        </div>

                        <div className="auth-field-group">
                            <label>Senha</label>
                            <PinInput
                                length={4}
                                value={password}
                                onChange={setPassword}
                                type="password"
                            />
                        </div>

                        <button
                            className="btn-auth-submit"
                            onClick={handleConfirmClick}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loader-dot"></span>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && <div className="auth-error-inline">{error}</div>}

                </div>
            </div>
        </div>
    );
};
