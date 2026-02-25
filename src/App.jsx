import { useState, useRef, useCallback, useEffect } from 'react';
import { TableCard } from './components/TableCard';
import { Sidebar } from './components/Sidebar';
import { tableService } from './services/tableService';
import { authService } from './services/authService';
import { restaurantService } from './services/restaurantService';
import './App.css';

function App() {
  // State for Tables
  // const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Initial Dummy Data
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('menuxTables');
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 40 }, (_, index) => {
      const id = index + 1;
      return { id, number: id, status: 'Livre', amount: '0,00', name: `Mesa ${id}` };
    });
  });

  // State for Tables
  // const [tables, setTables] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // State for Tables
  // const [tables, setTables] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Fetch Tables
  const fetchTables = useCallback(async () => {
    try {
      const data = await tableService.getTables();
      // Sort tables by Number
      setTables(data.sort((a, b) => a.number - b.number));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize App Context (Restaurant & Auth)
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Identify Restaurant ID from URL
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const restaurantIdParam = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

        if (!restaurantIdParam) {
          console.error("No restaurant ID provided in the URL.");
          setIsLoading(false);
          return;
        }

        // 2. Fetch Restaurant Details
        const restaurant = await restaurantService.getById(restaurantIdParam);

        if (restaurant && restaurant.id) {
          localStorage.setItem('restaurantId', restaurant.id);
          console.log(`Restaurant Context Loaded: ${restaurant.name} (${restaurant.id})`);
        }

        // 3. Auto-login (Dev/Admin)
        if (!authService.isAuthenticated()) {
          try {
            await authService.login('admin@admin.com', 'admin');
          } catch (e) {
            console.error("Auto-login failed", e);
          }
        }

        // 4. Fetch Tables
        fetchTables();

      } catch (error) {
        console.error("Initialization Failed:", error);
        setIsLoading(false);
      }
    };

    init();
  }, [fetchTables]);

  // Poll every 5 seconds to keep status updated
  useEffect(() => {
    let timeoutId;

    const poll = async () => {
      try {
        await fetchTables();
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        timeoutId = setTimeout(poll, 30000);
      }
    };

    // Start polling after 30 seconds (initial fetch handles immediate load)
    timeoutId = setTimeout(poll, 30000);

    return () => clearTimeout(timeoutId);

    // const interval = setInterval(fetchTables, 5000);
    // return () => clearInterval(interval);
  }, [fetchTables]);

  const handleOrderConfirmed = (tableId) => {
    // Refresh tables after order confirmation
    fetchTables();
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
                  id={table.number}
                  status={table.status}
                  amount={table.amount}
                  onClick={() => handleTableClick(table.id)}
                  isSelected={selectedTableId === table.id}
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
