import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LogOut, BookOpen, FileText, Users, Settings, UserCircle, LayoutDashboard, BarChart2, UploadCloud } from 'lucide-react';

// Fonction toast temporaire
const toast = (options) => {
    console.log('Toast:', options.title, '-', options.description);
};

// Composants UI simplifiés
const Button = ({ children, variant = 'default', className = '', onClick, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    };
    
    return (
        <button 
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} h-10 py-2 px-4 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            {React.Children.map(children, child => 
                React.cloneElement(child, { isOpen, setIsOpen })
            )}
        </div>
    );
};

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen, asChild }) => (
    <div onClick={() => setIsOpen(!isOpen)}>
        {children}
    </div>
);

const DropdownMenuContent = ({ children, isOpen, setIsOpen, className = '', align = 'end' }) => {
    if (!isOpen) return null;
    const alignClass = align === 'end' ? 'right-0' : 'left-0';
    return (
        <div className={`absolute ${alignClass} mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${className}`}>
            <div className="py-1">
                {React.Children.map(children, child => 
                    React.cloneElement(child, { setIsOpen })
                )}
            </div>
        </div>
    );
};

const DropdownMenuItem = ({ children, onClick, className = '', setIsOpen, asChild }) => {
    if (asChild) {
        return React.cloneElement(children, {
            className: `w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center cursor-pointer ${className}`,
            onClick: () => {
                if (onClick) onClick();
                setIsOpen(false);
            }
        });
    }
    
    return (
        <button
            onClick={() => {
                if (onClick) onClick();
                setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center cursor-pointer ${className}`}
        >
            {children}
        </button>
    );
};

const DropdownMenuLabel = ({ children, className = '' }) => (
    <div className={`px-4 py-2 text-sm font-medium text-gray-900 ${className}`}>
        {children}
    </div>
);

const DropdownMenuSeparator = () => (
    <div className="h-px bg-gray-200 mx-1 my-1" />
);

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [favicon, setFavicon] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    setFavicon(localStorage.getItem('app_favicon') || '');
    setLogo(localStorage.getItem('app_logo') || '');
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  const isCoach = user?.role === 'coach' || user?.role === 'supercoach';

  const handleImageUpload = (file, type) => {
    if (!isCoach) {
        toast({
            title: "Action non autorisée",
            description: "Seuls les coachs peuvent modifier les images.",
            variant: "destructive"
        });
        return;
    }
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon'].includes(file.type)) {
        toast({ title: "Format de fichier non valide", description: "Veuillez choisir une image au format PNG, JPG, ou SVG.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Fichier trop volumineux", description: "Veuillez choisir une image de moins de 2 Mo.", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const img = new Image();
        img.onload = () => {
            if (type === 'favicon' && img.naturalWidth !== img.naturalHeight) {
                toast({ title: "Dimensions du favicon incorrectes", description: "L'image du favicon doit être carrée (même hauteur et largeur).", variant: "destructive" });
                return;
            }

            try {
              localStorage.setItem(`app_${type}`, base64);
              if (type === 'favicon') {
                setFavicon(base64);
                const link = document.querySelector("link[rel~='icon']");
                if (link) link.href = base64;
              }
              if (type === 'logo') setLogo(base64);
              toast({ title: "Succès", description: `Le ${type} a été mis à jour.` });
            } catch (error) {
               toast({ title: "Erreur de stockage", description: "L'image est trop grande pour être sauvegardée.", variant: "destructive" });
            }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (type) => {
      if (!isCoach) return;
      document.getElementById(`${type}-input`).click();
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                 <div onClick={() => triggerUpload('favicon')} className={`relative group ${isCoach ? 'cursor-pointer' : ''}`}>
                    {favicon ? (
                        <img src={favicon} alt="Favicon Souveniirs" className="h-10 w-10 object-cover rounded" />
                    ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                           <UploadCloud className="h-5 w-5 text-gray-500" />
                        </div>
                    )}
                    {isCoach && (
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <UploadCloud className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>
                <input id="favicon-input" type="file" accept="image/png, image/jpeg, image/svg+xml, image/x-icon" hidden onChange={(e) => handleImageUpload(e.target.files[0], 'favicon')} disabled={!isCoach} />

                 <div onClick={() => triggerUpload('logo')} className={`relative group ${isCoach ? 'cursor-pointer' : ''}`}>
                    {logo ? (
                        <img src={logo} alt="Logo Souveniirs" className="h-10 w-40 object-contain" />
                    ) : (
                        <div className="h-10 w-40 bg-gray-200 rounded flex items-center justify-center">
                           <UploadCloud className="h-5 w-5 text-gray-500" />
                        </div>
                    )}
                    {isCoach && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <UploadCloud className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>
                <input id="logo-input" type="file" accept="image/png, image/jpeg, image/svg+xml" hidden onChange={(e) => handleImageUpload(e.target.files[0], 'logo')} disabled={!isCoach} />
              </div>
              
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/lessons">
                  <Button variant={isActive('/lessons') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Leçons</span>
                  </Button>
                </Link>
                
                <Link to="/chapters">
                  <Button variant={isActive('/chapters') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Mes Chapitres</span>
                  </Button>
                </Link>
                
                {isCoach && (
                  <>
                    <Link to="/coach">
                      <Button variant={isActive('/coach') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                     <Link to="/analytics">
                      <Button variant={isActive('/analytics') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                        <BarChart2 className="h-4 w-4" />
                        <span>Analytics</span>
                      </Button>
                    </Link>
                    <Link to="/admin/content">
                      <Button variant={isActive('/admin/content') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Gestion Contenu</span>
                      </Button>
                    </Link>
                    <Link to="/admin/users">
                      <Button variant={isActive('/admin/users') ? 'secondary' : 'ghost'} className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Gestion Utilisateurs</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                       <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 border">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link to="/profile">
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Mon Profil</span>
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </nav>
    </header>
  );
}
