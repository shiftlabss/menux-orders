import React from 'react';
import PropTypes from 'prop-types';
import './TableCard.css';

export const TableCard = ({ id, status = 'Livre', amount = '0,00', onClick, isSelected }) => {
  // Normalize status to lowercase for CSS class mapping
  const statusKey = status.toLowerCase();

  // Determine if we should show details (everything except 'livre')
  const showDetails = statusKey !== 'livre';

  return (
    <div className={`table-card status-${statusKey} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="card-header">
        <div className="table-number">{id}</div>
        <div className="status-badge">
          <span className="status-dot"></span>
          {status}
        </div>
      </div>

      {showDetails && (
        <div className="card-content">
          <div>
            <div className="info-label">Status da Mesa</div>
            {/* Visual placeholder text matching structure */}
            <div className="info-value">Em Atendimento</div>
          </div>
          <div className="card-divider" />
          <div className="price-value">R$ {amount}</div>
        </div>
      )}
    </div>
  );
};

TableCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['Livre', 'Ocupada', 'Encerrando', 'Encerrada']),
  amount: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};
