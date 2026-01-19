import { useState, useRef, useCallback, useEffect } from 'react';
import { TableCard } from './components/TableCard';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  // Initial Dummy Data
  const [tables, setTables] = useState(() => Array.from({ length: 40 }, (_, index) => {
    const id = index + 1;
    return { id, status: 'Livre', amount: '0,00', name: `Mesa ${id}` };
  }));

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

  // State for Resizable Sidebar
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('menuxSidebarWidth');
    return saved ? parseInt(saved, 10) : 440;
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
      const newWidth = window.innerWidth - e.clientX;

      // Constraints
      if (newWidth < 300) return;
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor" />
            <path d="M11 7H13V15H11V7ZM11 17H13V19H11V17Z" fill="currentColor" />
          </svg>
          {/* Placeholder logo text based on image */}
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>menux</span>
        </div>
      </header>

      <main className="main-content">
        {/* Left Section: Table Grid - Grows to fill remaining space */}
        <div className="tables-section" style={{ flex: 1 }}>
          <div className="tables-grid">
            {tables.map((table) => (
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
