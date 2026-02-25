import React, { useState } from 'react';
import { authService } from '../services/authService';
import './LoginModal.css';

export const LoginModal = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Preencha email e senha.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await authService.login(email, password);
            onLoginSuccess();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Credenciais inválidas ou erro no servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-modal-overlay">
            <div className="login-modal-content">
                <div className="login-header">
                    <img src="/logo-menux.svg" alt="menux" className="login-logo" />
                    <h2>Acesso Restrito</h2>
                    <p>Faça login para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button
                        type="submit"
                        className="btn-login-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="loader-dot"></span> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
