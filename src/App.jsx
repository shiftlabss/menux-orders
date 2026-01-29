import { useState, useRef, useCallback, useEffect } from 'react';
import { TableCard } from './components/TableCard';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  // Initial Dummy Data
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('menuxTables');
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 40 }, (_, index) => {
      const id = index + 1;
      return { id, number: id, status: 'Livre', amount: '0,00', name: `Mesa ${id}` };
    });
  });

  // Persist Tables
  useEffect(() => {
    localStorage.setItem('menuxTables', JSON.stringify(tables));
  }, [tables]);

  const handleOrderConfirmed = (tableId) => {
    setTables(prevTables => prevTables.map(table => {
      if (table.id === tableId) {
        return { ...table, status: 'Ocupada', amount: '123,00' };
      }
      return table;
    }));
  };

  // State for Table Detail View
  const [selectedTableId, setSelectedTableId] = useState(null);

  // State for Table Search
  const [searchTerm, setSearchTerm] = useState('');

  // State for Resizable Sidebar
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('menuxSidebarWidth');
    const parsed = saved ? parseInt(saved, 10) : 654;
    return Math.max(parsed, 654);
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarWidthRef = useRef(sidebarWidth);

  // Update ref whenever state changes needed for saving
  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  // Handle Resizing Side Effect
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      // Calculate new width: Total Width - Mouse X (Right Sidebar)
      let newWidth = window.innerWidth - e.clientX;

      // Constraints
      if (newWidth < 654) newWidth = 654;
      if (newWidth > window.innerWidth * 0.8) return;

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save final width
      localStorage.setItem('menuxSidebarWidth', sidebarWidthRef.current);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Global Styles
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const startResizing = () => {
    setIsResizing(true);
  };


  const handleTableClick = (id) => {
    setSelectedTableId(id);
  };

  const handleCloseSidebar = () => {
    setSelectedTableId(null);
  };

  // Derived state
  const activeTable = tables.find(t => t.id === selectedTableId);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo">
          <img src="/logo-menux.svg" alt="menux" style={{ height: '24px' }} />
        </div>
      </header>

      <main className="main-content">
        {/* Left Section: Table Grid - Grows to fill remaining space */}
        <div className="tables-section" style={{ flex: 1 }}>
          {/* Search Bar */}
          <div className="tables-search-wrapper">
            <div className="search-input-container">
              <svg className="search-icon-sm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar mesa..."
                className="tables-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="tables-grid">
            {tables
              .filter(table => table.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((table) => (
                <TableCard
                  key={table.id}
                  id={table.id}
                  status={table.status}
                  amount={table.amount}
                  onClick={() => handleTableClick(table.id)}
                />
              ))}
          </div>
        </div>

        {/* Resize Handle */}
        <div className="resize-handle" onMouseDown={startResizing} />

        {/* Right Section: Resizable Sidebar */}
        <div
          className="sidebar-section"
          style={{ width: sidebarWidth, flex: 'none' }}
        >
          <Sidebar
            tables={tables}
            activeTable={activeTable}
            onClose={handleCloseSidebar}
            onConfirmOrder={handleOrderConfirmed}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
