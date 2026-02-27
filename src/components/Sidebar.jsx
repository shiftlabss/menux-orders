import React, { useState, useRef, useEffect } from 'react';
import './Sidebar.css';
import { SidebarDetail } from './SidebarDetail';
import { waiterService } from '../services/waiterService';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';

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
    const safeTables = Array.isArray(tables) ? tables : [];
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

    // New State for Order Logic
    const [waiterToken, setWaiterToken] = useState(null);
    const [waiterInfo, setWaiterInfo] = useState(null); // { name, nickname }
    const [orderData, setOrderData] = useState(null);
    const [activeTableItems, setActiveTableItems] = useState([]); // For displaying items in Transfer/Group views

    // Track previous table ID to prevent view reset on polling updates
    const prevTableIdRef = useRef(null);

    // Effect: Handle Active Table Selection from Parent
    useEffect(() => {
        const currentId = props.activeTable?.id;
        const prevId = prevTableIdRef.current;

        // Only react if the Table ID actually changed (user selected a new table)
        // OR if we transitioned from No Table to Table (or vice versa)
        if (currentId !== prevId) {
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
                    setViewMode('home');
                }
            } else {
                // If activeTable is cleared (e.g. Back button), ensure we go to Home
                setViewMode('home');
            }

            // Update ref
            prevTableIdRef.current = currentId;
        }
    }, [props.activeTable]);

    // Filter tables logic (Dynamic)
    // For 'create_order' (default/home), we want 'Livre'. 
    // For 'group_tables', we want tables to merge (usually occupied). 
    // For 'transfer_table', we want destination (usually 'Livre' or 'Ocupada').
    // Simplified: Show all for special modes, filter for create_order.
    const availableTables = (['group_tables', 'transfer_table'].includes(viewMode))
        ? safeTables.filter(t => t.id !== props.activeTable?.id) // Exclude current table
        : safeTables.filter(t => t.status === 'Livre');

    const filteredTables = availableTables.filter(t => {
        const matchesName = (t.name || '').toLowerCase().includes((tableName || '').toLowerCase());
        const isAlreadySelected = viewMode === 'group_tables'
            ? selectedGroupTables.some(sel => sel.id === t.id)
            : false;
        return matchesName && !isAlreadySelected;
    });

    const [focusedIndex, setFocusedIndex] = useState(-1);

    const handleTableChange = (e) => {
        setTableName(e.target.value);
        setShowDropdown(true);
        setFocusedIndex(-1); // Reset focus when typing
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
            setFocusedIndex(-1);
        } else {
            // Single-select logic
            setSelectedTable(table);
            setTableName('');
            setShowDropdown(false);
            setFocusedIndex(-1);
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

    // ---- State: Authentication ----
    const [idGarcom, setIdGarcom] = useState(['', '', '', '']);
    const [senha, setSenha] = useState(['', '', '', '']);
    const [authStatus, setAuthStatus] = useState('idle'); // idle | loading | success | error

    // Refs for Auto-focus
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
    const handleAuthConfirm = async () => {
        setAuthStatus('loading');
        try {
            const restId = localStorage.getItem('restaurantId');
            const pin = idGarcom.join('');
            const pass = senha.join('');

            const response = await waiterService.auth(pin, pass, restId);

            if (response.token) {
                setWaiterToken(response.token);
                // Also store waiter info if available in response
                // Assuming response structure: { token: '...', waiter: { name: '...', nickname: '...' } }
                setWaiterInfo({
                    name: response.waiter?.name,
                    nickname: response.waiter?.nickname,
                    id: response.waiter?.id
                });

                setAuthStatus('success');
                // Auto focus code input after success
                setTimeout(() => codeRefs.current[0]?.focus(), 100);
            }
        } catch (error) {
            console.error('Auth User error:', error);
            setAuthStatus('idle'); // Allow retry? Or error state?
            alert('Erro na autenticação: ' + error.message);
        }
    };

    // ---- State: Order Code ----
    const [pedidoCode, setPedidoCode] = useState(['', '', '', '']);
    const [codeStatus, setCodeStatus] = useState('idle'); // idle, loading, success
    const codeRefs = useRef([]);
    const footerBtnRef = useRef(null);

    // // Handle Code Confirm
    const handleCodeConfirm = async () => {
        setCodeStatus('loading');
        try {
            const restId = localStorage.getItem('restaurantId');
            const code = pedidoCode.join('');

            const data = await orderService.getOrderByCode(code, restId, waiterToken);
            setOrderData(data); // Store order data

            setCodeStatus('success');
            // Show order details *after* success state confirms
            setTimeout(() => {
                setIsOrderVisible(true);
                // Focus Footer Button for final "Enter" confirmation
                setTimeout(() => footerBtnRef.current?.focus(), 100);
            }, 500);
        } catch (error) {
            console.error('Order Fetch error:', error);
            setCodeStatus('idle');
            alert('Erro ao buscar pedido: ' + error.message);
        }
    };
    // const codeRefs = useRef([]);
    // const footerBtnRef = useRef(null);

    // // ---- State: Order Code ----
    // const [pedidoCode, setPedidoCode] = useState(['', '', '', '']);
    // const [codeStatus, setCodeStatus] = useState('idle');
    // Handle Code Confirm
    // const handleCodeConfirm = async () => {
    //     setCodeStatus('loading');
    //     try {
    //         const restId = localStorage.getItem('restaurantId');
    //         const code = pedidoCode.join('');

    //         const data = await orderService.getOrderByCode(code, restId, waiterToken);
    //         setOrderData(data); // Store order data

    //         setCodeStatus('success');
    //         // Show order details *after* success state confirms
    //         setTimeout(() => {
    //             setIsOrderVisible(true);
    //             // Focus Footer Button for final "Enter" confirmation
    //             setTimeout(() => footerBtnRef.current?.focus(), 100);
    //         }, 500);
    //     } catch (error) {
    //         console.error('Order Fetch error:', error);
    //         setCodeStatus('idle');
    //         alert('Erro ao buscar pedido: ' + error.message);
    //     }
    // };

    // ---- State: Product Launch ----
    const [productCode, setProductCode] = useState('');
    const [productQty, setProductQty] = useState('1');
    const [productStatus, setProductStatus] = useState('idle');

    // const handlePinChange = (index, value, setter, currentValues, refs) => {
    //     if (!/^\d*$/.test(value)) return;
    //     const newValues = [...currentValues];
    //     newValues[index] = value;
    //     setter(newValues);

    //     // Auto-advance
    //     if (value && index < 3) {
    //         refs.current[index + 1]?.focus();
    //     }
    // };

    // const handleAuthConfirm = () => {
    //     setAuthStatus('loading');
    //     // Mock API call
    //     setTimeout(() => {
    //         setAuthStatus('success');
    //         // Auto-focus next step (Order Code or Product Code depending on mode)
    //         setTimeout(() => {
    //             codeRefs.current[0]?.focus();
    //         }, 100);
    //     }, 1000);
    // };

    // const handleCodeConfirm = () => {
    //     setCodeStatus('loading');
    //     setTimeout(() => {
    //         setCodeStatus('success');
    //         setIsOrderVisible(true);
    //         setTimeout(() => {
    //             footerBtnRef.current?.scrollIntoView({ behavior: 'smooth' });
    //         }, 100);
    //     }, 800);
    // };

    const handleProductConfirm = () => {
        setProductStatus('loading');
        setTimeout(() => {
            setProductStatus('success');
            // Show success overlay
            setShowSuccessOverlay(true);

            // Allow launching multiple products? 
            // For now, let's reset to allow another add or finish.
            setTimeout(() => {
                setProductStatus('idle');
                setShowSuccessOverlay(false);
                setProductCode('');
                setProductQty('1');
                codeRefs.current[0]?.focus();
            }, 2000); // Quick turnaround for multiple generic products
        }, 800);
    };

    const handleMesaKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setShowDropdown(true); // Ensure dropdown is open
            setFocusedIndex(prev => (prev < filteredTables.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault(); // Prevent accidental form submission if any

            // 1. If an item is focused via Arrow keys, select it
            if (focusedIndex >= 0 && filteredTables[focusedIndex]) {
                handleSelectTable(filteredTables[focusedIndex]);
                return;
            }

            // 2. Try exact number match from input (handle "2" vs "Mesa 2")
            // We strip non-digits to compare raw numbers if possible, 
            // or match the exact user input against table.number specifically.
            const rawInput = tableName.trim();
            const matchByNumber = availableTables.find(t =>
                t.number?.toString() === rawInput ||
                t.name?.toLowerCase() === rawInput.toLowerCase() ||
                t.name?.toLowerCase() === `mesa ${rawInput}`.toLowerCase()
            );

            if (matchByNumber) {
                handleSelectTable(matchByNumber);
                return;
            }

            // 3. Fallback: If there's exactly one filtered result, select it
            if (filteredTables.length === 1) {
                handleSelectTable(filteredTables[0]);
                return;
            }

            // 4. Try legacy ID match (rarely used if user types UUID)
            const matchById = availableTables.find(t => t.id?.toString() === rawInput);
            if (matchById) {
                handleSelectTable(matchById);
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







    const handleTransferConfirm = async () => {
        if (!selectedTable) {
            alert("Selecione a mesa de destino.");
            return;
        }
        if (!isAuthFilled) {
            alert("Informe o ID e senha do garçom.");
            return;
        }

        const restId = localStorage.getItem('restaurantId');
        // Extract numbers safely
        const sourceTableNum = props.activeTable ? parseInt(String(props.activeTable.name).replace(/\D/g, '')) : null;
        const destTableNum = selectedTable ? parseInt(String(selectedTable.name).replace(/\D/g, '')) : null;

        const code = idGarcom.join('');
        const pass = senha.join('');

        try {
            await tableService.transferTable({
                restaurantId: restId,
                sourceTableNumber: sourceTableNum,
                destinationTableNumber: destTableNum,
                waiterCode: code,
                waiterPassword: pass
            });

            setShowSuccessOverlay(true);

            setTimeout(() => {
                setShowSuccessOverlay(false);
                if (props.onConfirmOrder) props.onConfirmOrder(props.activeTable.id); // Refresh
                props.onClose(); // Close Sidebar
            }, 3000);

        } catch (error) {
            console.error("Transfer error:", error);
            alert("Erro ao transferir: " + error.message);
        }
    };

    const handleFinalConfirm = async () => {
        if (viewMode === 'create_order') {
            // Confirm Order Flow
            if (orderData && waiterToken) {
                try {
                    const restId = localStorage.getItem('restaurantId');
                    const code = pedidoCode.join('');
                    // Extract numeric part from table name or use id if it matches user expectation
                    // Assuming name is like "Mesa 5" or just "5"
                    const tableNum = selectedTable ? parseInt(selectedTable.name.replace(/\D/g, '') || selectedTable.name) : null;

                    await orderService.confirmByCode(code, tableNum, restId, waiterToken, waiterInfo);
                    // await orderService.confirmByCode(code, tableNum, restId, waiterToken);

                    // Success
                    setShowSuccessOverlay(true);

                    // Clear Data & Token immediately
                    setWaiterToken(null);
                    setWaiterInfo(null);
                    setOrderData(null);

                    setTimeout(() => {
                        setShowSuccessOverlay(false);
                        handleClearTable({ stopPropagation: () => { } });
                        setViewMode('home');
                    }, 3000);
                } catch (error) {
                    console.error("Confirm error:", error);
                    alert("Erro ao confirmar: " + error.message);
                }
            }
        } else if (viewMode === 'transfer_table') {
            // Transfer Table Flow
            if (selectedTable && waiterToken) { // WaiterToken implies auth success if we reuse auth flow, 
                // BUT payload asks for raw code/password. 
                // We should probably rely on state variables `idGarcom` and `senha` directly if we force user to enter them.
                // Let's use the explicit input values if available.

                const restId = localStorage.getItem('restaurantId');
                const sourceTableNum = parseInt(props.activeTable.name.replace(/\D/g, ''));
                const destTableNum = parseInt(selectedTable.name.replace(/\D/g, '') || selectedTable.name);
                const code = idGarcom.join('');
                const pass = senha.join('');

                try {
                    await tableService.transferTable({
                        restaurantId: restId,
                        sourceTableNumber: sourceTableNum,
                        destinationTableNumber: destTableNum,
                        waiterCode: code,
                        waiterPassword: pass
                    });

                    setShowSuccessOverlay(true);

                    setTimeout(() => {
                        setShowSuccessOverlay(false);
                        if (props.onConfirmOrder) props.onConfirmOrder(props.activeTable.id); // Refresh
                        props.onClose(); // Close Sidebar
                    }, 3000);

                } catch (error) {
                    console.error("Transfer error:", error);
                    alert("Erro ao transferir: " + error.message);
                }
            }
        } else if (selectedTable && onConfirmOrder) {
            // ... existing logic for other flows (if any uses this locally, though create_order usage above replaces logic for this view)
            // Actually, the original handleFinalConfirm seemed generic.
            // But logic above handles the 'create_order' specific flow described.
            // If viewMode is different, we fallback to props callback

            // 1. Commit the order immediately
            onConfirmOrder(selectedTable.id);

            // 2. Show Success Overlay
            setShowSuccessOverlay(true);

            // 3. Wait 5 seconds then reset everything
            setTimeout(() => {
                setShowSuccessOverlay(false);
                handleClearTable({ stopPropagation: () => { } });
                setViewMode('home');
            }, 10000);
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
        setWaiterToken(null);
        setWaiterInfo(null);
        setOrderData(null);

        setViewMode('create_order');
        // Auto-focus the table input after render
        setTimeout(() => {
            const input = document.querySelector('.mesa-input');
            if (input) input.focus();
        }, 100);
    };

    const handleNewOrderFromDetail = () => {
        // Reset Form State
        setTableName('');
        setSelectedTable(props.activeTable);
        setShowDropdown(false);
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setPedidoCode(['', '', '', '']);
        setCodeStatus('idle');
        setIsOrderVisible(false);
        setWaiterToken(null);
        setWaiterInfo(null);
        setOrderData(null);

        // Manually clear physical input values from refs if they held stale data
        idRefs.current.forEach(input => {
            if (input) {
                input.value = '';
                input.blur(); // Ensure it doesn't immediately capture a lingering keyup
            }
        });
        senhaRefs.current.forEach(input => {
            if (input) input.value = '';
        });
        codeRefs.current.forEach(input => {
            if (input) input.value = '';
        });

        setViewMode('create_order');

        // Auto-focus the ID Garcom input after render, with enough delay to prevent capturing keyboard events (like 'r' from 'Enter'/'Space')
        setTimeout(() => {
            idRefs.current[0]?.focus();
        }, 300);
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

    // Check for pending vs confirmed items. Pending status is 'WAITING'.
    const pendingItems = orderData?.items?.filter(item => {
        const status = item.status || item.order?.status || orderData?.status;
        return status === 'WAITING';
    }) || [];

    const confirmedItems = orderData?.items?.filter(item => {
        const status = item.status || item.order?.status || orderData?.status;
        return status !== 'WAITING';
    }) || [];

    const hasPendingItems = pendingItems.length > 0;

    // Order can only be confirmed if visible and there are pending items
    const isOrderConfirmable = isOrderVisible && hasPendingItems;

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
        // Reset local wizard state
        setIdGarcom(['', '', '', '']);
        setSenha(['', '', '', '']);
        setAuthStatus('idle');
        setTableName('');
        setSelectedTable(null); // Ensure no table is pre-selected as destination

        // Fetch items for the active table to display in transfer view
        if (props.activeTable?.id) {
            tableService.getTableOrders(props.activeTable.id).then(orders => {
                // Aggregate items
                const allItems = [];
                orders.forEach(o => {
                    if (o.items) allItems.push(...o.items);
                });
                setActiveTableItems(allItems);
            });
        }

        setViewMode('transfer_table');
        setTimeout(() => {
            // Focus logic if needed
        }, 30000);
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
            onNewOrder={handleNewOrderFromDetail}
            onBack={props.onClose}
            onFinalize={() => {
                if (props.onConfirmOrder) props.onConfirmOrder(props.activeTable.id);
                props.onClose();
            }}
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
                    {/* <div className="home-section middle">
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
                    </div> */}

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
                                        filteredTables.map((table, index) => (
                                            <div
                                                key={table.id}
                                                className={`mesa-dropdown-item ${index === focusedIndex ? 'focused' : ''}`}
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
                                            name={`idGarcom-${i}`}
                                            autoComplete="new-password"
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
                                            name={`senhaGarcom-${i}`}
                                            autoComplete="new-password"
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

                            <div className="input-group" style={{ width: 100, flexShrink: 0 }}>
                                <label className="input-label" style={{ opacity: isProductStepEnabled ? 1 : 0.5 }}>Qtd.</label>
                                <div className="mesa-input-wrapper" style={{ opacity: isProductStepEnabled ? 1 : 0.5, backgroundColor: isProductStepEnabled ? 'var(--bg-surface)' : 'var(--bg-input-disabled)', maxWidth: 100 }}>
                                    <input
                                        type="number"
                                        className="mesa-input"
                                        value={productQty}
                                        onChange={(e) => setProductQty(e.target.value)}
                                        disabled={!isProductStepEnabled}
                                        onKeyDown={handleProductKeyDown}
                                        style={{ textAlign: 'center', width: '100%' }}
                                        min="1"
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
                                        filteredTables.map((table, index) => (
                                            <div key={table.id} className={`mesa-dropdown-item ${index === focusedIndex ? 'focused' : ''}`} onMouseDown={() => handleSelectTable(table)}>{table.name}</div>
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
                                        filteredTables.map((table, index) => (
                                            <div key={table.id} className={`mesa-dropdown-item ${index === focusedIndex ? 'focused' : ''}`} onMouseDown={() => handleSelectTable(table)}>{table.name}</div>
                                        ))
                                    ) : (
                                        <div className="mesa-dropdown-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>Nenhuma mesa encontrada</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Auth Section for Transfer (Required by endpoint) */}
                    <div className="sidebar-auth-section">
                        <div className="section-row">
                            <div className="input-group">
                                <label className="input-label">Seu ID Garçom</label>
                                <div className="pin-inputs">
                                    {idGarcom.map((val, i) => (
                                        <input
                                            key={i}
                                            name={`transferIdGarcom-${i}`}
                                            autoComplete="new-password"
                                            className="pin-box"
                                            value={val}
                                            onChange={(e) => handlePinChange(i, e.target.value, setIdGarcom, idGarcom, idRefs)}
                                            ref={el => idRefs.current[i] = el}
                                            maxLength={1}
                                        // Auto-focus next logic handles flow
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Senha</label>
                                <div className="pin-inputs">
                                    {senha.map((val, i) => (
                                        <input
                                            key={i}
                                            name={`transferSenhaGarcom-${i}`}
                                            autoComplete="new-password"
                                            className="pin-box"
                                            type="password"
                                            value={val}
                                            onChange={(e) => handlePinChange(i, e.target.value, setSenha, senha, senhaRefs)}
                                            ref={el => senhaRefs.current[i] = el}
                                            maxLength={1}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Audit Section */}
                    <div
                        className="sidebar-content-area"
                        style={{ flex: 1, backgroundColor: 'var(--bg-surface-alt)', padding: '24px', overflowY: 'auto' }}
                    // Keep focus logic simple or remove standard blur triggers if interfering
                    >
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Itens a Transferir</h3>

                        {/* Active Table Items */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>De: {props.activeTable?.name}</div>
                            {activeTableItems.length > 0 ? (
                                activeTableItems.map((item, i) => (
                                    <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: 13 }}>
                                        <span>{item.quantity}x {item.menuItem?.name || item.name}</span>
                                        <span>R$ {Number(item.price || item.unitPrice || 0).toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Nenhum item encontrado nesta mesa.</div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-footer-section">
                        <button
                            className={`footer-btn ${selectedTable && isAuthFilled ? 'success' : 'disabled'}`}
                            onClick={handleTransferConfirm}
                            disabled={!selectedTable || !isAuthFilled}
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
                                        filteredTables.map((table, index) => (
                                            <div
                                                key={table.id}
                                                className={`mesa-dropdown-item ${index === focusedIndex ? 'focused' : ''}`}
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
                                            name={`createIdGarcom-${i}`}
                                            autoComplete="new-password"
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
                                            name={`createSenhaGarcom-${i}`}
                                            autoComplete="new-password"
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
                                            name={`pedidoCode-${i}`}
                                            autoComplete="off"
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
                                <h3 className="details-title">Detalhes do Pedido #{orderData?.code || '...'}</h3>

                                {[...pendingItems, ...confirmedItems].map((item, index) => {
                                    const itemStatus = item.status || item.order?.status || orderData?.status;
                                    const isPending = itemStatus === 'WAITING';

                                    return (
                                        <div className={`order-item-card ${isPending ? 'pending' : 'confirmed'}`} key={item.id || index}>
                                            <div className="item-header">
                                                <div className="item-name-group">
                                                    {isPending && (
                                                        <span className="status-icon pending-icon" title="Item a confirmar">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <polyline points="12 6 12 12 16 14" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                    {!isPending && (
                                                        <span className="status-icon confirmed-icon" title="Item confirmado">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                    <span className="item-name">{item.quantity}x {item.menuItem.name}</span>
                                                </div>
                                                <span className="item-price">R$ {Number(item.menuItem.price || 0).toFixed(2)}</span>
                                            </div>

                                            <div className="item-footer">
                                                {item.notes && (
                                                    <div className="item-addons" style={{ fontSize: 16 }}>
                                                        • {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 6. Footer */}
                    <div className="sidebar-footer-section">
                        {isOrderVisible && (
                            <div className="footer-total-row">
                                <span className="total-label">Total do Pedido</span>
                                <span className="total-amount">R$ {Number(orderData?.total || 0).toFixed(2)}</span>
                            </div>
                        )}

                        {isOrderVisible && (
                            !hasPendingItems && confirmedItems.length > 0 ? (
                                <div className="order-status-warning confirmed-label">
                                    Pedido CONFIRMADO.
                                </div>
                            ) : hasPendingItems && confirmedItems.length > 0 ? (
                                <div className="order-status-warning partial-label">
                                    Pedidos a CONFIRMAR
                                </div>
                            ) : null
                        )}

                        <button
                            ref={footerBtnRef}
                            className={`footer-btn ${isOrderConfirmable ? 'success' : 'disabled'}`}
                            onClick={handleFinalConfirm}
                            disabled={!isOrderConfirmable}
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
