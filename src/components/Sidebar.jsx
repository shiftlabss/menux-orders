import React, { useState, useRef, useEffect } from 'react';
import './Sidebar.css';
import { SidebarDetail } from './SidebarDetail';

// Icons
const SearchIcon = () => (
    <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="spinner"></div> // CSS class defined in Sidebar.css
);

export const Sidebar = (props) => {
    // Destructure for internal usage if needed, but `props.activeTable` is used in new code
    const { tables = [], onConfirmOrder } = props;
    // ---- State: Main View ----
    const [isOrderVisible, setIsOrderVisible] = useState(false); // Controls empty vs filled content

    // ---- State: Table Input ----
    const [tableName, setTableName] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Filter tables logic (Dynamic)
    const availableTables = tables.filter(t => t.status === 'Livre');
    const filteredTables = availableTables.filter(t =>
        t.name.toLowerCase().includes(tableName.toLowerCase())
    );

    const handleTableChange = (e) => {
        setTableName(e.target.value);
        setShowDropdown(true);
    };

    const handleSelectTable = (table) => {
        setSelectedTable(table);
        setTableName(''); // Clear input text
        setShowDropdown(false);
        // Focus next step (ID Garçom) - wait for render
        setTimeout(() => idRefs.current[0]?.focus(), 100);
    };

    const handleClearTable = (e) => {
        e.stopPropagation(); // Prevent re-triggering stuff
        setSelectedTable(null);
    };

    // ---- State: Auth (ID & Password) ----
    const [idGarcom, setIdGarcom] = useState(['', '', '', '']);
    const [senha, setSenha] = useState(['', '', '', '']);
    const [authStatus, setAuthStatus] = useState('idle'); // idle, loading, success

    const idRefs = useRef([]);
    const senhaRefs = useRef([]);

    // Generic Pin Handler
    const handlePinChange = (index, value, setter, currentValues, refs) => {
        if (value.length > 1) return; // Single char only

        const newValues = [...currentValues];
        newValues[index] = value;
        setter(newValues);

        // Auto-focus next input if value entered
        if (value && index < 3) {
            refs.current[index + 1].focus();
        }
    };

    // Handle Auth Confirm
    const handleAuthConfirm = () => {
        setAuthStatus('loading');

        // Mock API call
        setTimeout(() => {
            setAuthStatus('success');
            // Auto focus code input after success
            setTimeout(() => codeRefs.current[0]?.focus(), 100);
        }, 1500);
    };

    // ---- State: Order Code ----
    const [pedidoCode, setPedidoCode] = useState(['', '', '', '']);
    const [codeStatus, setCodeStatus] = useState('idle'); // idle, loading, success
    const codeRefs = useRef([]);
    const footerBtnRef = useRef(null);

    // Handle Code Confirm
    const handleCodeConfirm = () => {
        setCodeStatus('loading');

        setTimeout(() => {
            setCodeStatus('success');
            // Show order details *after* success state confirms
            setTimeout(() => {
                setIsOrderVisible(true);
                // Focus Footer Button for final "Enter" confirmation
                setTimeout(() => footerBtnRef.current?.focus(), 100);
            }, 500);
        }, 1500);
    };

    // --- Enter Key Handlers ---

    const handleMesaKeyDown = (e) => {
        if (e.key === 'Enter') {
            // First try finding by ID explicitly (e.g. user typed "5" -> matches ID 5)
            const matchById = availableTables.find(t => t.id.toString() === tableName.trim());

            // Then try exact name match
            const exactNameMatch = filteredTables.find(t => t.name.toLowerCase() === tableName.toLowerCase());

            if (matchById) {
                handleSelectTable(matchById);
            } else if (exactNameMatch) {
                handleSelectTable(exactNameMatch);
            } else if (filteredTables.length === 1) {
                handleSelectTable(filteredTables[0]);
            }
        }
    };

    const handleAuthKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Check if user is on ID inputs and wants to jump to Password
            const activeIsId = idRefs.current.includes(document.activeElement);
            // If ID is filled and we are on ID input, jump to Password
            if (activeIsId && idGarcom.every(v => v)) {
                senhaRefs.current[0]?.focus();
                return;
            }

            if (idGarcom.every(v => v) && senha.every(v => v) && authStatus !== 'loading' && authStatus !== 'success') {
                handleAuthConfirm();
            }
        }
    };

    const handleCodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (pedidoCode.every(v => v) && codeStatus !== 'loading' && codeStatus !== 'success') {
                handleCodeConfirm();
            }
        }
    };





    // State for View Mode: 'home' | 'create_order'
    const [viewMode, setViewMode] = useState('home');

    // State for Success Overlay
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    const handleFinalConfirm = () => {
        if (selectedTable && onConfirmOrder) {
            // 1. Commit the order immediately
            onConfirmOrder(selectedTable.id);

            // 2. Show Success Overlay
            setShowSuccessOverlay(true);

            // 3. Wait 5 seconds then reset everything
            setTimeout(() => {
                setShowSuccessOverlay(false);
                handleClearTable({ stopPropagation: () => { } });
                setViewMode('home');
            }, 5000);
        }
    };


    const handleStartOrder = () => {
        // Reset Form State
        setTableName('');
        setSelectedTable(null);
        setShowDropdown(false);
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setPedidoCode(['', '', '', '']);
        setCodeStatus('idle');
        setIsOrderVisible(false);

        setViewMode('create_order');
        // Auto-focus the table input after render
        setTimeout(() => {
            const input = document.querySelector('.mesa-input');
            if (input) input.focus();
        }, 100);
    };

    // Global Key Listener for Numpad *
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Check for Numpad * or Shift+8 (*)
            if (e.key === '*' || e.code === 'NumpadMultiply') {
                if (viewMode === 'home') {
                    e.preventDefault();
                    handleStartOrder();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [viewMode]);

    // Derived State for Step Enforcement
    const isTableSelected = !!selectedTable;

    // Auth Step Enabled: Only if Table is selected
    const isAuthStepEnabled = isTableSelected;
    const isAuthFilled = idGarcom.every(d => d !== '') && senha.every(d => d !== '');

    // Code Step Enabled: Only if Auth is successful
    const isCodeStepEnabled = authStatus === 'success';
    const isCodeFilled = pedidoCode.every(d => d !== '');

    // Helper to render button content based on state
    const renderButtonContent = (status) => {
        if (status === 'loading') {
            return <LoadingSpinner />;
        }
        // Always show check for idle (white on black) and success (white on green)
        return <CheckIcon />;
    };

    const SmileyFaceIcon = ({ color = 'var(--text-inverse)' }) => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: color }}>
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" />
            <path d="M9 9H9.01" />
            <path d="M15 9H15.01" />
        </svg>
    );

    // --- RENDER HELPERS ---

    // Helper for Detail View
    // Helper for Detail View
    if (props.activeTable) {
        return <SidebarDetail table={props.activeTable} />;
    }

    return (
        <aside className="sidebar-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Success Overlay */}
            <div className={`sidebar-success-overlay ${showSuccessOverlay ? 'visible' : ''}`}>
                <div className="success-icon-large">
                    <SmileyFaceIcon />
                </div>
                <h3 className="success-title">Pedido Anotado!</h3>
                <p className="success-desc">Agora você pode acompanhar a mesa clicando nela.</p>
            </div>

            {viewMode === 'home' ? (
                // --- HOME VIEW ---
                <div className="sidebar-home-wrapper">
                    {/* Top Section: Create Order */}
                    <div className="home-section top">
                        <div className="home-content-centered">
                            <h3 className="home-title">Pronto para<br />lançar um pedido?</h3>
                            <p className="home-subtitle">Use o código da mesa para<br />registrar o pedido do cliente.</p>
                            <button className="home-action-btn-black" onClick={handleStartOrder}>
                                Lançar pedido
                            </button>
                        </div>

                        <div className="home-shortcut-hint">
                            Para ser mais rápido, clica no <kbd className="shortcut-key">*</kbd> para começar a lançar.
                        </div>
                    </div>

                    {/* Bottom Section: Table Select */}
                    <div className="home-section bottom">
                        <div className="home-icon-wrapper">
                            <img src="/icon-menux.svg" alt="Menux Icon" width="36" height="36" />
                        </div>
                        <h3 className="home-title">Selecione uma mesa</h3>
                        <p className="home-subtitle">Ao selecionar uma mesa, você verá as ações disponíveis para ela.</p>
                    </div>
                </div>
            ) : (
                // --- CREATE ORDER VIEW (Existing) ---
                <>
                    {/* 1. Header */}
                    <div className="sidebar-header-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-primary)' }}
                                onClick={() => setViewMode('home')}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19L5 12L12 5" />
                                </svg>
                            </div>
                            <h2 className="sidebar-title">Lançar Pedido</h2>
                        </div>
                    </div>

                    {/* 2. Mesa Section (Interactable) */}
                    <div className="sidebar-mesa-section">
                        <div className="mesa-input-wrapper">
                            {selectedTable ? (
                                // Render Pill Inside Wrapper
                                <div className="mesa-tag">
                                    <span
                                        className="mesa-tag-close"
                                        onClick={handleClearTable}
                                        style={{ marginRight: 6 }}
                                    >×</span>
                                    {selectedTable.name}
                                </div>
                            ) : (
                                // Render Input Inside Wrapper
                                <>
                                    <SearchIcon />
                                    <input
                                        type="text"
                                        className="mesa-input"
                                        placeholder="Digite o número da Mesa"
                                        value={tableName}
                                        onChange={handleTableChange}
                                        onKeyDown={handleMesaKeyDown}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                                    />
                                </>
                            )}

                            {/* Dropdown Logic */}
                            {showDropdown && !selectedTable && tableName && (
                                <div className="mesa-dropdown-list">
                                    {filteredTables.length > 0 ? (
                                        filteredTables.map(table => (
                                            <div
                                                key={table.id}
                                                className="mesa-dropdown-item"
                                                onMouseDown={() => handleSelectTable(table)} // onMouseDown fires before Blur
                                            >
                                                {table.name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="mesa-dropdown-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>
                                            Nenhuma mesa encontrada
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Auth Section */}
                    <div className="sidebar-auth-section">
                        <div className="section-row">
                            <div className="input-group">
                                <label className="input-label" style={{ opacity: isAuthStepEnabled ? 1 : 0.5 }}>Seu ID Garçom</label>
                                <div className="pin-inputs">
                                    {idGarcom.map((val, i) => (
                                        <input
                                            key={i}
                                            className="pin-box"
                                            value={val}
                                            onChange={(e) => handlePinChange(i, e.target.value, setIdGarcom, idGarcom, idRefs)}
                                            ref={el => idRefs.current[i] = el}
                                            maxLength={1}
                                            disabled={!isAuthStepEnabled}
                                            onKeyDown={handleAuthKeyDown}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label" style={{ opacity: isAuthStepEnabled ? 1 : 0.5 }}>Senha</label>
                                <div className="pin-inputs">
                                    {senha.map((val, i) => (
                                        <input
                                            key={i}
                                            className="pin-box"
                                            type="password" /* Masked Input */
                                            value={val}
                                            onChange={(e) => handlePinChange(i, e.target.value, setSenha, senha, senhaRefs)}
                                            ref={el => senhaRefs.current[i] = el}
                                            maxLength={1}
                                            disabled={!isAuthStepEnabled}
                                            onKeyDown={handleAuthKeyDown}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                className={`action-btn ${authStatus === 'success' ? 'success' : ''} ${authStatus === 'loading' ? 'loading' : ''}`}
                                onClick={handleAuthConfirm}
                                disabled={!isAuthStepEnabled || authStatus === 'loading' || authStatus === 'success' || !isAuthFilled}
                            >
                                {renderButtonContent(authStatus)}
                            </button>
                        </div>
                    </div>

                    {/* 4. Code Section */}
                    <div className="sidebar-code-section">
                        <div className="input-group">
                            <label className="input-label" style={{ opacity: isCodeStepEnabled ? 1 : 0.5 }}>Código do Pedido</label>
                            <div className="section-row" style={{ justifyContent: 'flex-start' }}>
                                <div className="pin-inputs">
                                    {pedidoCode.map((val, i) => (
                                        <input
                                            key={i}
                                            className="pin-box"
                                            value={val}
                                            onChange={(e) => handlePinChange(i, e.target.value, setPedidoCode, pedidoCode, codeRefs)}
                                            ref={el => codeRefs.current[i] = el}
                                            maxLength={1}
                                            disabled={!isCodeStepEnabled}
                                            onKeyDown={handleCodeKeyDown}
                                        />
                                    ))}
                                </div>
                                <button
                                    className={`action-btn ${codeStatus === 'success' ? 'success' : ''} ${codeStatus === 'loading' ? 'loading' : ''}`}
                                    onClick={handleCodeConfirm}
                                    disabled={!isCodeStepEnabled || codeStatus === 'loading' || codeStatus === 'success' || !isCodeFilled}
                                >
                                    {renderButtonContent(codeStatus)}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. Content Area */}
                    <div className="sidebar-content-area">
                        {!isOrderVisible ? (
                            <div className="empty-state">
                                <div className="empty-icon-wrapper">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" style={{ opacity: 0 }} />
                                        <path d="M8 10V12" strokeLinecap="round" />
                                        <path d="M16 10V12" strokeLinecap="round" />
                                        <path d="M9 16C9 16 11 18 12 18C13 18 15 16 15 16" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h3 className="empty-title">Sem pedidos ainda</h3>
                                <p className="empty-desc">Adicione o código do pedido primeiro, que irá aparecer os produtos escolhidos</p>
                            </div>
                        ) : (
                            <div className="order-details-wrapper">
                                <h3 className="details-title">Detalhes do Pedido</h3>

                                {/* Mock Items x4 */}
                                {[1, 2, 3, 4].map((item) => (
                                    <div className="order-item-card" key={item}>
                                        <div className="item-header">
                                            <div className="item-name-group">
                                                <span className="item-name">1x Nome do Prato</span>
                                                <div className="copy-id-badge" style={{ cursor: 'pointer' }}>
                                                    Copiar ID do Produto
                                                </div>
                                            </div>
                                            <span className="item-price">R$ 34,00</span>
                                        </div>

                                        <div className="item-footer">
                                            <div className="item-addons" style={{ fontSize: 16 }}>
                                                • Adicional   • Adicional
                                            </div>
                                            <span className="extra-price">+ R$ 15,00 em Adicionais</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 6. Footer */}
                    <div className="sidebar-footer-section">
                        {isOrderVisible && (
                            <div className="footer-total-row">
                                <span className="total-label">Total do Pedido</span>
                                <span className="total-amount">R$ 123.00</span>
                            </div>
                        )}

                        <button
                            ref={footerBtnRef}
                            className={`footer-btn ${isOrderVisible ? 'success' : 'disabled'}`}
                            onClick={handleFinalConfirm}
                        >
                            {isOrderVisible ? (
                                <>
                                    <CheckIcon /> Confirmar pedido
                                </>
                            ) : (
                                "Aguardado preenchimento"
                            )}
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
};
