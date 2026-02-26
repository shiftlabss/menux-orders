import React, { useState, useRef, useEffect } from 'react';
import './SidebarDetail.css';
import { WaiterAuthModal } from './WaiterAuthModal';
import { tableService } from '../services/tableService';



// Icons

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const MaestroIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10 0.5 0.5 0 0 1 0.5-0.5" />
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    </svg>
);

const LightningIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CircleCheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);

const DrinkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
        <path d="M9 12v6" />
        <path d="M8 12v6" />
        <path d="M3 11h18" />
        <path d="M5 11v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        <path d="M5 6v5" />
        <path d="M19 6v5" />
        <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" />
        <line x1="12" y1="4" x2="12" y2="2" />
    </svg>
);

const GroupIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const TransferIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4"></path>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <path d="M7 23l-4-4 4-4"></path>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);

const FlagIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

// const TrashIcon = () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <polyline points="3 6 5 6 21 6"></polyline>
//         <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//     </svg>
// );

// (Removed unused Icon components if any, keeping used ones)

const LogOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);



export const SidebarDetail = ({ table, onGroup, onTransfer, onBack, onFinalize }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        if (table?.id) {
            setLoading(true);
            tableService.getTableOrders(table.id)
                .then(setOrders)
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setOrders([]);
        }
    }, [table?.id]);

    // Data Processing
    const duration = '...'; // TODO: Calculate from openedAt
    const total = table.amount || 'R$ 0,00';

    // Find waiter name from the first order or table data
    // The table object from `tableService` has `waiterId`, but not name. 
    // The order object usually has `waiter` relation? Let's check. 
    // If not, we might only show ID or "Garçom"
    const firstOrder = orders[0];
    const waiterName = firstOrder?.waiter?.name || 'Garçom';

    // Aggregate Items
    const itemsHelper = {};
    let calculatedTotal = 0;

    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const name = item.menuItem?.name || item.name || 'Item';
                const price = Number(item.price || item.unitPrice || item.menuItem?.price || 0);
                const key = item.menuItemId || name; // Group by menuItemId or Name

                if (!itemsHelper[key]) {
                    itemsHelper[key] = {
                        name,
                        qty: 0,
                        price: price,
                        totalValue: 0
                    };
                }
                itemsHelper[key].qty += item.quantity;
                itemsHelper[key].totalValue += (price * item.quantity);
                calculatedTotal += (price * item.quantity);
            });
        }
    });

    const items = Object.values(itemsHelper);

    // If total from table is not accurate or missing, we use calculatedTotal
    const formattedCalculatedTotal = `R$ ${calculatedTotal.toFixed(2).replace('.', ',')}`;
    const displayTotal = total !== 'R$ 0,00' ? total : formattedCalculatedTotal;

    // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    // const [itemToDelete, setItemToDelete] = useState(null);

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsAuthModalOpen(true);
    };

    // const handleAuthConfirm = async (code, password) => {
    //     try {
    //         // Call service
    //         await tableService.removeItem(table.id, itemToDelete.id, code, password);

    //         // UI Update ( Optimistic or after success)
    //         setItems(prev => prev.filter(i => i !== itemToDelete));

    //         // Close modal
    //         setIsAuthModalOpen(false);
    //         setItemToDelete(null);
    //     } catch (error) {
    //         console.error("Failed to delete item", error);
    //         throw error; // Re-throw so modal handles error display
    //     }
    // }
    // }, [table?.id]);

    // // Data Processing
    // const duration = '...'; // TODO: Calculate from openedAt
    // const total = table.amount || 'R$ 0,00';

    // Find waiter name from the first order or table data
    // The table object from `tableService` has `waiterId`, but not name. 
    // The order object usually has `waiter` relation? Let's check. 
    // If not, we might only show ID or "Garçom"
    // const firstOrder = orders[0];
    // const waiterName = firstOrder?.waiter?.name || 'Garçom';



    const scrollRef = useRef(null);



    const handleFinalize = async () => {
        if (!table?.id) return;

        try {
            await tableService.releaseTable(table.id);
            alert("Mesa finalizada e liberada com sucesso!");
            if (onFinalize) {
                onFinalize();
            } else if (onBack) {
                onBack();
            }
        } catch (error) {
            console.error("Release Table error:", error);
            alert("Erro ao finalizar mesa: " + error.message);
        }
    };

    const handleAuthConfirm = async (code, password) => {
        try {
            // Call service
            await tableService.removeItem(table.id, itemToDelete.id, code, password);

            // UI Update ( Optimistic or after success)
            setItems(prev => prev.filter(i => i !== itemToDelete));

            // Close modal
            setIsAuthModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete item", error);
            throw error; // Re-throw so modal handles error display
        }
    };

    return (
        <>
            <aside className="sidebar-detail-container" style={{ position: 'relative', overflow: 'visible' }}>

                {/* 1. Header Pro */}
                <div className="detail-header-pro">
                    <div className="header-left-group">
                        <div style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-primary)', marginRight: 8 }} onClick={onBack}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19L5 12L12 5" />
                            </svg>
                        </div>
                        <span className="mesa-id-badge">{table.name}</span>
                        <span className={`status-pill-${table.status === 'Livre' ? 'green' : 'blue'}`}>
                            <span className={`status-dot-${table.status === 'Livre' ? 'green' : 'blue'}`}></span>
                            {table.status}
                        </span>
                        <div className="header-time-text">
                            • Ativa há {duration}
                        </div>
                    </div>
                    <div className="header-right-group">
                        <div className="total-label-xs">Total Parcial</div>
                        <div className="total-value-md">{displayTotal}</div>
                    </div>
                </div>




                {/* Scrollable Content */}
                <div style={{ flex: 1, height: 'fit-content' }}>

                    {/* 2. Maestro Section */}
                    <div className="detail-maestro-section">
                        <div className="maestro-title-row">
                            <MaestroIcon /> Sugestão do Maestro
                        </div>

                        <div className='maestro-card-pro'>

                            <div className="card-content-block">
                                <span className="card-icon-circle"><DrinkIcon /></span>
                                <div className="card-text-group">
                                    <h3>Oferecer Bebida</h3>
                                    <p>Mesa sem pedido de bebida há 5min</p>
                                </div>
                            </div>

                            <div className="card-suggestions-box">
                                <span className="suggestion-pill">Coca-Cola</span>
                                <span className="suggestion-pill">Suco de Laranja</span>
                                <span className="suggestion-pill">Água com Gás</span>
                                <span className="suggestion-pill">Moscow Mule</span>
                            </div>

                            <div className="card-actions-row">
                                <button className="btn-seen-black">
                                    <CheckIcon /> Marcar como visto
                                </button>
                                <button className="btn-ignore-grey">
                                    <XIcon /> Ignorar
                                </button>
                            </div>
                        </div>
                    </div >

                </div >



                {/* 3. Operational Details */}
                <div className="detail-ops-section">
                    <h3 className="section-title-bold">Detalhes Operacionais</h3>
                    <div className="ops-meta-row">
                        <ClockIcon /> Ativa há {duration}
                        <span>•</span>
                        <span>{orders.length} Pedido{orders.length !== 1 && 's'}</span>
                        <span>•</span>
                        <span>{items.reduce((acc, curr) => acc + curr.qty, 0)} itens consumidos</span>
                        <span>•</span>
                        <span className="waiter-pill">{waiterName}</span>
                    </div>
                </div>

                {/* 4. Items List */}
                <div className="detail-items-section">
                    <h3 className="section-title-bold" style={{ marginBottom: 12 }}>Itens na Mesa</h3>
                    <div className="items-list-vertical">
                        {items.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px 0', color: 'var(--text-tertiary)' }}>
                                Nenhum item pedido ainda.
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div className="item-row-operational" key={idx}>
                                    <div className="item-left-block">
                                        <div className="item-qty-badge-op">{item.qty}</div>
                                        <div className="item-meta-block">
                                            <span className="item-name-op">{item.name}</span>
                                        </div>
                                    </div>
                                    <div className="item-price-op">
                                        R$ {item.totalValue.toFixed(2).replace('.', ',')}
                                        <button
                                            onClick={() => handleDeleteClick(item)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: '12px', padding: '4px' }}
                                            title="Excluir item"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>





            </aside >

            <div className="detail-footer-pro">
                <div className="footer-left-block">
                    <span className="footer-label">Total Acumulado</span>
                    <span className="footer-value">{displayTotal}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {/* <button
                        className="btn-action-footer"
                        onClick={onGroup}
                        title="Agrupar: Somar contas, mesas continuam existindo"
                    >
                        <GroupIcon /> Agrupar
                    </button> */}
                    <button
                        className="btn-action-footer"
                        onClick={onTransfer}
                        title="Transferir: Mover conta, mesa de origem deixa de existir"
                    >
                        <TransferIcon /> Transferir Mesa
                    </button>

                    <button className="btn-finish-red" onClick={handleFinalize}>
                        <LogOutIcon /> Finalizar Mesa
                    </button>
                    <button className="btn-close-purple">
                        <CircleCheckIcon /> Fechar conta
                    </button>
                </div>
            </div>



            {
                isAuthModalOpen && (
                    <WaiterAuthModal
                        isOpen={isAuthModalOpen}
                        onClose={() => setIsAuthModalOpen(false)}
                        onConfirm={handleAuthConfirm}
                        title="Autorização para Excluir Item"
                    />
                )
            }


        </>
    );

};
