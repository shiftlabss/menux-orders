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

    // State for View Mode: 'home' | 'create_order'
    const [viewMode, setViewMode] = useState('home');

    // State for Success Overlay
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    // ---- State: Table Input ----
    const [tableName, setTableName] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedGroupTables, setSelectedGroupTables] = useState([]); // Multi-select for grouping
    const [showDropdown, setShowDropdown] = useState(false);

    // Effect: Handle Active Table Selection from Parent
    useEffect(() => {
        if (props.activeTable) {
            if (props.activeTable.status === 'Livre') {
                // Auto-start Create Order flow
                setViewMode('create_order');
                setSelectedTable(props.activeTable);

                // Reset Wizard State
                setTableName('');
                setIdGarcom(['', '', '', '']);
                setSenha(['', '', '', '']);
                setAuthStatus('idle');
                setPedidoCode(['', '', '', '']);
                setCodeStatus('idle');
                setIsOrderVisible(false);
            } else {
                // Show Detail Overview (default 'home' renders SidebarDetail if activeTable exists)
                // We force 'home' to ensure we exit any other mode like 'create_order'
                setViewMode('home');
            }
        } else {
            // If activeTable is cleared (e.g. Back button), ensure we go to Home
            setViewMode('home');
        }
    }, [props.activeTable]);

    // Filter tables logic (Dynamic)
    // For 'create_order' (default/home), we want 'Livre'. 
    // For 'group_tables', we want tables to merge (usually occupied). 
    // For 'transfer_table', we want destination (usually 'Livre' or 'Ocupada').
    // Simplified: Show all for special modes, filter for create_order.
    const availableTables = (['group_tables', 'transfer_table'].includes(viewMode))
        ? tables.filter(t => t.id !== props.activeTable?.id) // Exclude current table
        : tables.filter(t => t.status === 'Livre');

    const filteredTables = availableTables.filter(t => {
        const matchesName = t.name.toLowerCase().includes(tableName.toLowerCase());
        const isAlreadySelected = viewMode === 'group_tables'
            ? selectedGroupTables.some(sel => sel.id === t.id)
            : false;
        return matchesName && !isAlreadySelected;
    });

    const handleTableChange = (e) => {
        setTableName(e.target.value);
        setShowDropdown(true);
    };

    const handleSelectTable = (table) => {
        if (viewMode === 'group_tables') {
            // Multi-select logic
            if (!selectedGroupTables.find(t => t.id === table.id)) {
                setSelectedGroupTables([...selectedGroupTables, table]);
            }
            setTableName('');
            // Keep focus on input for more selections
            setShowDropdown(false);
        } else {
            // Single-select logic
            setSelectedTable(table);
            setTableName('');
            setShowDropdown(false);
            // Focus next step (ID Garçom) - wait for render
            setTimeout(() => idRefs.current[0]?.focus(), 100);
        }
    };

    const handleClearTable = (e, tableId = null) => {
        e.stopPropagation();
        if (viewMode === 'group_tables' && tableId) {
            setSelectedGroupTables(selectedGroupTables.filter(t => t.id !== tableId));
        } else {
            setSelectedTable(null);
        }
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

    // ---- State: Product Launch ----
    const [productCode, setProductCode] = useState('');
    const [productQty, setProductQty] = useState('1');
    const [productStatus, setProductStatus] = useState('idle'); // idle, loading, success

    const handleProductConfirm = () => {
        setProductStatus('loading');
        setTimeout(() => {
            setProductStatus('success');
            // Trigger final success sequence
            setTimeout(() => {
                handleFinalProductConfirm();
            }, 500);
        }, 1500);
    };

    const handleFinalProductConfirm = () => {
        if (selectedTable) {
            setShowSuccessOverlay(true);
            setTimeout(() => {
                setShowSuccessOverlay(false);
                handleClearTable({ stopPropagation: () => { } });
                setViewMode('home');
            }, 3000);
        }
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

    const handleProductKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (productCode && productQty && productStatus !== 'loading' && productStatus !== 'success') {
                handleProductConfirm();
            }
        }
    };







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

    const handleStartProductLaunch = () => {
        // Reset Form State
        setTableName('');
        setSelectedTable(null);
        setShowDropdown(false);
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setProductCode('');
        setProductQty('1');
        setProductStatus('idle');

        setViewMode('launch_product');
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

            // Check for Numpad / or /
            if (e.key === '/' || e.code === 'NumpadDivide') {
                if (viewMode === 'home') {
                    e.preventDefault();
                    handleStartProductLaunch();
                }
            }

            // Check for Escape to return Home
            if (e.key === 'Escape') {
                if (viewMode !== 'home') {
                    e.preventDefault();
                    setViewMode('home');
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

    // Product Step Enabled: Only if Auth is successful
    const isProductStepEnabled = authStatus === 'success';
    const isProductFilled = productCode.length > 0 && productQty > 0;

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

    // Helper handlers for switching modes from Detail
    const handleOpenGroup = () => {
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setTableName('');
        setViewMode('group_tables');
    };

    const handleOpenTransfer = () => {
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setTableName('');
        setViewMode('transfer_table');
    };

    const handleCancelAction = () => {
        setViewMode('home');
    };

    // --- RENDER HELPERS ---

    // 1. If active table AND NOT in a special mode, show detail
    const isSpecialMode = ['group_tables', 'transfer_table', 'create_order', 'launch_product'].includes(viewMode);

    // Note: create_order/launch_product are usually triggered from Home.
    // However, if props.activeTable is true (Sidebar passed it), we usually want Detail.
    // BUT if user clicked "Group" from Detail, we want Group View.
    // So: if activeTable is present, start in Detail. 
    // If Detail calls setViewMode('group'), we show Group.

    // We only show SidebarDetail if activeTable is present AND viewMode is 'home' (default).
    // If viewMode is 'group_tables', we render that instead.

    if (props.activeTable && viewMode === 'home') {
        return <SidebarDetail
            table={props.activeTable}
            onGroup={handleOpenGroup}
            onTransfer={handleOpenTransfer}
            onBack={props.onClose}
        />;
    }

    return (
        <aside className="sidebar-container" style={{ position: 'relative', overflow: 'visible' }}>
            {/* Success Overlay */}
            <div className={`sidebar-success-overlay ${showSuccessOverlay ? 'visible' : ''}`}>
                <div className="success-icon-large">
                    <SmileyFaceIcon />
                </div>
                <h3 className="success-title">
                    {viewMode === 'launch_product' ? 'Produto Lançado!' : 'Pedido Anotado!'}
                </h3>
                <p className="success-desc">
                    {viewMode === 'launch_product'
                        ? 'O produto foi adicionado à mesa com sucesso.'
                        : 'Agora você pode acompanhar a mesa clicando nela.'}
                </p>
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
                            Atalho rápido: <kbd className="shortcut-key">*</kbd>
                        </div>
                    </div>

                    {/* Middle Section: Launch Product */}
                    <div className="home-section middle">
                        <div className="home-content-centered">
                            <h3 className="home-title">Adicionar produto<br />à uma mesa?</h3>
                            <p className="home-subtitle">Lance novos itens rapidamente<br />em uma mesa já aberta.</p>
                            <button className="home-action-btn-black" onClick={handleStartProductLaunch}>
                                Lançar produto
                            </button>
                        </div>

                        <div className="home-shortcut-hint">
                            Atalho rápido: <kbd className="shortcut-key">/</kbd>
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
            ) : viewMode === 'launch_product' ? (
                // --- LAUNCH PRODUCT VIEW ---
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
                            <h2 className="sidebar-title">Lançar Produto</h2>
                        </div>
                    </div>

                    {/* 2. Mesa Section (Interactable) - REUSED */}
                    <div className="sidebar-mesa-section">
                        <div className="mesa-input-wrapper">
                            {selectedTable ? (
                                <div className="mesa-tag">
                                    <span
                                        className="mesa-tag-close"
                                        onClick={handleClearTable}
                                        style={{ marginRight: 6 }}
                                    >×</span>
                                    {selectedTable.name}
                                </div>
                            ) : (
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
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    />
                                </>
                            )}
                            {showDropdown && !selectedTable && tableName && (
                                <div className="mesa-dropdown-list">
                                    {filteredTables.length > 0 ? (
                                        filteredTables.map(table => (
                                            <div
                                                key={table.id}
                                                className="mesa-dropdown-item"
                                                onMouseDown={() => handleSelectTable(table)}
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

                    {/* 3. Auth Section - REUSED */}
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
                                            type="password"
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

                    {/* 4. Product Section - NEW */}
                    <div className="sidebar-code-section">
                        <div className="section-row" style={{ alignItems: 'flex-start' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label className="input-label" style={{ opacity: isProductStepEnabled ? 1 : 0.5 }}>Código do Produto</label>
                                <div className="mesa-input-wrapper" style={{ opacity: isProductStepEnabled ? 1 : 0.5, backgroundColor: isProductStepEnabled ? 'var(--bg-surface)' : 'var(--bg-input-disabled)' }}>
                                    <input
                                        type="text"
                                        className="mesa-input"
                                        placeholder="Cód."
                                        value={productCode}
                                        onChange={(e) => setProductCode(e.target.value)}
                                        disabled={!isProductStepEnabled}
                                        onKeyDown={handleProductKeyDown}
                                        ref={el => codeRefs.current[0] = el} // Reuse ref for focus
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ width: 80 }}>
                                <label className="input-label" style={{ opacity: isProductStepEnabled ? 1 : 0.5 }}>Qtd.</label>
                                <div className="mesa-input-wrapper" style={{ opacity: isProductStepEnabled ? 1 : 0.5, backgroundColor: isProductStepEnabled ? 'var(--bg-surface)' : 'var(--bg-input-disabled)' }}>
                                    <input
                                        type="number"
                                        className="mesa-input"
                                        value={productQty}
                                        onChange={(e) => setProductQty(e.target.value)}
                                        disabled={!isProductStepEnabled}
                                        onKeyDown={handleProductKeyDown}
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 29 }}> {/* Align with inputs */}
                                <button
                                    className={`action-btn ${productStatus === 'success' ? 'success' : ''} ${productStatus === 'loading' ? 'loading' : ''}`}
                                    onClick={handleProductConfirm}
                                    disabled={!isProductStepEnabled || productStatus === 'loading' || productStatus === 'success' || !isProductFilled}
                                >
                                    {renderButtonContent(productStatus)}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Blank Content Area to push generic structure */}
                    <div className="sidebar-content-area" style={{ flex: 1, backgroundColor: 'var(--bg-surface-alt)' }}>
                        <div className="empty-state">
                            <h3 className="empty-title">Preencha os dados</h3>
                            <p className="empty-desc">Informe a mesa, autentique e adicione os produtos.</p>
                        </div>
                    </div>
                </>
            ) : viewMode === 'group_tables' ? (
                // --- ARUPAR MESAS VIEW ---
                <>
                    <div className="sidebar-header-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-primary)' }} onClick={handleCancelAction}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19L5 12L12 5" />
                                </svg>
                            </div>
                            <h2 className="sidebar-title">Agrupar Mesas</h2>
                        </div>
                    </div>
                    <div className="sidebar-mesa-section">
                        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Mesa Principal (Destino)</div>
                        <div className="mesa-tag" style={{ border: '1px solid var(--color-violet-600)', backgroundColor: 'var(--color-violet-50)' }}>
                            {props.activeTable?.name}
                        </div>
                    </div>
                    <div className="sidebar-mesa-section" style={{ borderTop: 'none' }}>
                        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Mesas para Agrupar</div>
                        <div className="mesa-input-wrapper" style={{ flexWrap: 'wrap', gap: 6, paddingLeft: 12 }}>
                            {selectedGroupTables.map(t => (
                                <div className="mesa-tag" key={t.id} style={{ margin: 0 }}>
                                    <span className="mesa-tag-close" onClick={(e) => handleClearTable(e, t.id)} style={{ marginRight: 6 }}>×</span>
                                    {t.name}
                                </div>
                            ))}

                            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 120 }}>
                                {selectedGroupTables.length === 0 && <SearchIcon />}
                                <input
                                    type="text"
                                    className="mesa-input"
                                    placeholder={selectedGroupTables.length === 0 ? "Buscar mesa para agrupar" : "Adicionar outra..."}
                                    value={tableName}
                                    onChange={handleTableChange}
                                    onKeyDown={handleMesaKeyDown}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    style={{ paddingLeft: selectedGroupTables.length === 0 ? 0 : 4 }}
                                />
                            </div>

                            {showDropdown && tableName && (
                                <div className="mesa-dropdown-list">
                                    {filteredTables.length > 0 ? (
                                        filteredTables.map(table => (
                                            <div key={table.id} className="mesa-dropdown-item" onMouseDown={() => handleSelectTable(table)}>{table.name}</div>
                                        ))
                                    ) : (
                                        <div className="mesa-dropdown-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>Nenhuma mesa encontrada</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Audit Section */}
                    <div className="sidebar-content-area" style={{ flex: 1, backgroundColor: 'var(--bg-surface-alt)', padding: '24px', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Resumo dos Pedidos</h3>

                        {/* Active Table Items */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{props.activeTable?.name}</div>
                            {/* Mock Items */}
                            {[1, 2].map(i => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: 13 }}>
                                    <span>1x Moscow Mule</span>
                                    <span>R$ 24,00</span>
                                </div>
                            ))}
                        </div>

                        {/* Selected Tables Items */}
                        {selectedGroupTables.map(t => (
                            <div key={t.id} style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{t.name}</div>
                                {[1].map(i => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: 13 }}>
                                        <span>2x Coca-Cola</span>
                                        <span>R$ 12,00</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {selectedGroupTables.length === 0 && (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: 13, fontStyle: 'italic' }}>Selecione mesas para visualizar os itens a agrupar.</div>
                        )}
                    </div>

                    <div className="sidebar-footer-section">
                        <button
                            className={`footer-btn ${selectedGroupTables.length > 0 ? 'success' : 'disabled'}`}
                            onClick={handleFinalConfirm}
                            disabled={selectedGroupTables.length === 0}
                        >
                            <CheckIcon /> Confirmar Agrupamento
                        </button>
                    </div>
                </>
            ) : viewMode === 'transfer_table' ? (
                // --- TRANSFERIR MESA VIEW ---
                <>
                    <div className="sidebar-header-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-primary)' }} onClick={handleCancelAction}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19L5 12L12 5" />
                                </svg>
                            </div>
                            <h2 className="sidebar-title">Transferir Mesa</h2>
                        </div>
                    </div>
                    <div className="sidebar-mesa-section">
                        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Mesa de Origem (Será liberada)</div>
                        <div className="mesa-tag" style={{ border: '1px solid var(--color-red-600)', backgroundColor: 'var(--color-red-50)', color: 'var(--color-red-700)' }}>
                            {props.activeTable?.name}
                        </div>
                    </div>
                    <div className="sidebar-mesa-section" style={{ borderTop: 'none' }}>
                        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Mesa de Destino</div>
                        <div className="mesa-input-wrapper">
                            {selectedTable ? (
                                <div className="mesa-tag">
                                    <span className="mesa-tag-close" onClick={handleClearTable} style={{ marginRight: 6 }}>×</span>
                                    {selectedTable.name}
                                </div>
                            ) : (
                                <>
                                    <SearchIcon />
                                    <input type="text" className="mesa-input" placeholder="Buscar mesa de destino" value={tableName} onChange={handleTableChange} onKeyDown={handleMesaKeyDown} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
                                </>
                            )}
                            {showDropdown && !selectedTable && tableName && (
                                <div className="mesa-dropdown-list">
                                    {filteredTables.length > 0 ? (
                                        filteredTables.map(table => (
                                            <div key={table.id} className="mesa-dropdown-item" onMouseDown={() => handleSelectTable(table)}>{table.name}</div>
                                        ))
                                    ) : (
                                        <div className="mesa-dropdown-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>Nenhuma mesa encontrada</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Audit Section */}
                    <div className="sidebar-content-area" style={{ flex: 1, backgroundColor: 'var(--bg-surface-alt)', padding: '24px', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Itens a Transferir</h3>

                        {/* Active Table Items */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>De: {props.activeTable?.name}</div>
                            {/* Mock Items */}
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: 13 }}>
                                    <span>1x Moscow Mule</span>
                                    <span>R$ 24,00</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-footer-section">
                        <button
                            className={`footer-btn ${selectedTable ? 'success' : 'disabled'}`}
                            onClick={handleFinalConfirm}
                            disabled={!selectedTable}
                        >
                            <CheckIcon /> Confirmar Transferência
                        </button>
                    </div>
                </>
            ) : (
                // --- CREATE ORDER VIEW (Existing) ---
                <>
                    {/* 1. Header */}
                    <div className="sidebar-header-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-primary)' }}
                                onClick={() => props.activeTable ? props.onClose() : setViewMode('home')}
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
