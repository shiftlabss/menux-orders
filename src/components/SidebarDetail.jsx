import React from 'react';
import './SidebarDetail.css';

// Icons
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckboxFilledIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect width="18" height="18" rx="4" fill="white" />
        <path d="M5 9L7.5 11.5L13 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MaestroIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

const FlashIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const DrinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 21a6 6 0 0 0-12 0" />
        <circle cx="12" cy="11" r="3" />
        <path d="M10 21V14" />
        <path d="M14 21V14" />
        <path d="M12 2v2" />
        <path d="M8.5 2h7" />
    </svg>
);

// Mock Data matching the screenshot exactly
const MOCK_ITEMS = [
    { name: "1x Coca-Cola" },
    { name: "1x Suco de Laranja" },
    { name: "1x Água com Gás" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
    { name: "2x Moscow Mule" },
];

export const SidebarDetail = ({ table }) => {
    if (!table) return null;

    return (
        <div className="sidebar-detail-container">
            {/* 1. Header Section */}
            <div className="detail-header-section">
                <div className="header-left-group">
                    <div className="table-pill">Mesa {table.name.replace(/\D/g, '') || '2'}</div>
                    <span className="status-text">• Ocupada</span>
                    <span className="separator">·</span>
                    <div className="time-group">
                        <ClockIcon />
                        <span>Ativa há 1h44</span>
                    </div>
                </div>

                <div className="header-total-group">
                    <span className="header-total-label">Total Parcial</span>
                    <span className="header-total-value">R$ 123.00</span>
                </div>
            </div>

            {/* 2. Maestro Suggestion Section */}
            <div className="detail-maestro-section">
                <div className="maestro-header">
                    <div className="maestro-icon-custom" />
                    <span className="maestro-title-text">Sugestão do Maestro</span>
                </div>

                <div className="maestro-cards-scroll-container">
                    {/* Card 1 */}
                    <div className="card-suggestion">
                        {/* Priority Badge */}
                        <div className="priority-badge">
                            <FlashIcon /> Prioridade Média
                        </div>

                        <div className="suggestion-content">
                            <div className="suggestion-icon-placeholder">
                                <DrinkIcon />
                            </div>
                            <div className="suggestion-text-group">
                                <h4 className="suggestion-title">Oferecer Bebida</h4>
                                <p className="suggestion-reason">Mesa sem pedido de bebida há 5min</p>
                            </div>
                        </div>

                        {/* Suggestion Options Grid */}
                        <div className="suggestion-options-grid">
                            <div className="option-pill">Coca-Cola</div>
                            <div className="option-pill">Suco de Laranja</div>
                            <div className="option-pill">Água com Gás</div>
                            <div className="option-pill">Moscow Mule</div>
                        </div>

                        <div className="card-footer-actions">
                            <button className="btn-mark-seen">
                                <CheckboxFilledIcon />
                                Marcar como visto
                            </button>
                            <button className="btn-ignore">
                                <CloseIcon /> Ignorar
                            </button>
                        </div>
                    </div>

                    {/* Card 2 (Duplicate) */}
                    <div className="card-suggestion">
                        {/* Priority Badge */}
                        <div className="priority-badge">
                            <FlashIcon /> Prioridade Média
                        </div>

                        <div className="suggestion-content">
                            <div className="suggestion-icon-placeholder">
                                <DrinkIcon />
                            </div>
                            <div className="suggestion-text-group">
                                <h4 className="suggestion-title">Oferecer Bebida</h4>
                                <p className="suggestion-reason">Mesa sem pedido de bebida há 5min</p>
                            </div>
                        </div>

                        {/* Suggestion Options Grid */}
                        <div className="suggestion-options-grid">
                            <div className="option-pill">Coca-Cola</div>
                            <div className="option-pill">Suco de Laranja</div>
                            <div className="option-pill">Água com Gás</div>
                            <div className="option-pill">Moscow Mule</div>
                        </div>

                        <div className="card-footer-actions">
                            <button className="btn-mark-seen">
                                <CheckboxFilledIcon />
                                Marcar como visto
                            </button>
                            <button className="btn-ignore">
                                <CloseIcon /> Ignorar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-scroll-area">
                {/* 3. Operational Details */}
                <div className="detail-operational-section">
                    <h3 className="section-title">Detalhes Operacionais</h3>
                    <div className="ops-inline-row">
                        <div className="op-meta-item">
                            <ClockIcon />
                            <span>Ativa há 1h44</span>
                        </div>
                        <span className="separator">•</span>
                        <span className="op-text">1 Pedido</span>
                        <span className="separator">•</span>
                        <span className="op-text">0 itens consumidos</span>
                        <span className="separator">•</span>
                        <div className="waiter-badge">Nome do Garçom</div>
                    </div>
                </div>

                {/* 4. Items Section (Tags) */}
                <div className="detail-items-section">
                    <h3 className="section-title">Itens na Mesa</h3>
                    <div className="items-tags-wrapper">
                        {MOCK_ITEMS.map((item, idx) => (
                            <div key={idx} className="item-tag">
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Footer Section */}
            <div className="detail-footer-section">
                <div className="footer-content-row">
                    <div className="footer-total-group">
                        <span className="footer-label-small">Total Acumulado</span>
                        <span className="footer-amount-large">R$ 123.00</span>
                    </div>
                    <button className="btn-close-account">
                        <span className="btn-icon-circle"><CheckIcon /></span> Fechar conta
                    </button>
                </div>
            </div>
        </div>
    );
};
