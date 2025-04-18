import './NavBar.css';

interface NavBarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const NavBar: React.FC<NavBarProps> = ({ onNavigate, currentPage }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Transport Management</h1>
      </div>
      <div className="navbar-links">
        <button 
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button 
          className={`nav-link ${currentPage === 'historique' ? 'active' : ''}`}
          onClick={() => onNavigate('historique')}
        >
          Historique
        </button>
      </div>
    </nav>
  );
};


