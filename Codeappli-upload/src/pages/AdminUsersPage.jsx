import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from '../components/Navigation.jsx';
import { PlusCircle, MoreHorizontal, Search, Trash2, Edit, Copy, Eye, EyeOff, RefreshCw, Mail, UserPlus, Users, Link as LinkIcon } from 'lucide-react';
import { format, parseISO, differenceInDays, addMonths, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { sendEmail } from '../lib/email.js';

// Fonction toast temporaire
const toast = (options) => {
    console.log('Toast:', options.title, '-', options.description);
};

// Composants UI simplifiés pour le déploiement
const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '' }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        outline: 'border border-gray-300 hover:bg-gray-50 hover:text-gray-900',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    };
    const sizes = {
        default: 'h-10 py-2 px-4',
        icon: 'h-10 w-10',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md'
    };
    
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text', id }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
);

const Label = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {children}
    </label>
);

const Select = ({ children, value, onValueChange }) => {
    return (
        <div className="relative">
            <select 
                value={value} 
                onChange={(e) => onValueChange(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {children}
            </select>
        </div>
    );
};

const SelectItem = ({ value, children }) => (
    <option value={value}>{children}</option>
);

const Card = ({ children, className = '' }) => (
    <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }) => (
    <div className="flex flex-col space-y-1.5 p-4 sm:p-6">{children}</div>
);

const CardContent = ({ children }) => (
    <div className="p-4 pt-0 sm:p-6 sm:pt-0">{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-blue-100 text-blue-800',
        destructive: 'bg-red-100 text-red-800',
        outline: 'text-gray-900 border border-gray-300'
    };
    
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-md sm:max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ children }) => <div className="p-4 sm:p-6">{children}</div>;
const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-base sm:text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-xs sm:text-sm text-gray-600 mt-1">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">{children}</div>;

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

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => (
    <div onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    }}>
        {children}
    </div>
);

const DropdownMenuContent = ({ children, isOpen, setIsOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
                {React.Children.map(children, child => 
                    child ? React.cloneElement(child, { setIsOpen }) : null
                )}
            </div>
        </div>
    );
};

const DropdownMenuItem = ({ children, onClick, className = '', disabled = false, setIsOpen }) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled && onClick) {
                onClick();
                setIsOpen(false);
            }
        }}
        disabled={disabled}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
        {children}
    </button>
);

const DropdownMenuSeparator = () => (
    <div className="h-px bg-gray-200 mx-1 my-1" />
);

const generatePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const generateTempPassword = (length = 8) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export default function AdminUsersPage() {
    const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', access_duration: 1 });
    const navigate = useNavigate();
    const [visiblePasswords, setVisiblePasswords] = useState({});

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) {
            toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
            return;
        }

        let userPayload = {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };

        if (newUser.role === 'coach' || newUser.role === 'supercoach') {
            userPayload.password = generatePassword();
            userPayload.password_changed = true;
            userPayload.expires_at = null;
        } else {
            userPayload.temp_password = generateTempPassword();
            userPayload.password_changed = false;
            userPayload.expires_at = addMonths(new Date(), newUser.access_duration).toISOString();
        }

        addUser(userPayload);

        toast({ title: 'Succès', description: 'Nouvel utilisateur ajouté avec succès.' });
        setNewUser({ name: '', email: '', role: 'student', access_duration: 1 });
        setAddUserModalOpen(false);
    };

    const handleEditUser = () => {
        if (!userToEdit) return;

        const updatedUserData = {
            name: userToEdit.name,
            email: userToEdit.email,
            role: userToEdit.role,
        };

        if (userToEdit.role === 'student' && userToEdit.access_duration) {
            updatedUserData.expires_at = addMonths(new Date(), userToEdit.access_duration).toISOString();
            if (!isPast(new Date(updatedUserData.expires_at))) {
                updatedUserData.status = 'active';
            }
        } else if (userToEdit.role === 'coach' || userToEdit.role === 'supercoach') {
            updatedUserData.expires_at = null;
        }

        updateUser(userToEdit.id, updatedUserData);
        toast({ title: 'Succès', description: 'Utilisateur mis à jour.' });
        setEditUserModalOpen(false);
        setUserToEdit(null);
    };

    const handleOpenEditModal = (user) => {
        const accessDuration = user.expires_at ? Math.max(1, Math.round(differenceInDays(parseISO(user.expires_at), new Date()) / 30)) : 1;
        setUserToEdit({ ...user, access_duration: accessDuration });
        setEditUserModalOpen(true);
    };

    const handleDeleteUser = (userId) => {
        if (currentUser.id === userId) {
            toast({ title: "Action non autorisée", description: "Vous ne pouvez pas supprimer votre propre compte.", variant: "destructive" });
            return;
        }
        deleteUser(userId);
        toast({ title: 'Succès', description: 'Utilisateur supprimé.' });
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copié !', description: `${type} copié dans le presse-papiers.` });
        }, (err) => {
            toast({ title: 'Erreur', description: `Impossible de copier.`, variant: 'destructive' });
        });
    };

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const regeneratePassword = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const updatedFields = {};
        let emailTemplate;

        if(user.role === 'coach' || user.role === 'supercoach') {
            updatedFields.password = generatePassword();
            updatedFields.password_changed = true;
            emailTemplate = 'welcome_coach';
            copyToClipboard(updatedFields.password, 'Nouveau mot de passe');
        } else {
            updatedFields.temp_password = generateTempPassword();
            updatedFields.password_changed = false;
            updatedFields.password = '';
            updatedFields.first_login = true;
            emailTemplate = 'welcome_student';
            copyToClipboard(updatedFields.temp_password, 'Nouveau code d\'accès');
        }
        
        const updatedUser = updateUser(userId, updatedFields);
        
        sendEmail({
            to: updatedUser.email,
            template: emailTemplate,
            data: updatedUser
        });
    };

    const handleSendCredentials = (user) => {
        sendEmail({
            to: user.email,
            template: user.role === 'coach' || user.role === 'supercoach' ? 'welcome_coach' : 'welcome_student',
            data: user,
        });
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => {
                if (filter === 'all') return true;
                if (filter === 'coach') return u.role === 'coach' || u.role === 'supercoach';
                return u.role === filter;
            })
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, filter, searchTerm]);

    const getStatusBadge = (user) => {
        if (user.role === 'coach' || user.role === 'supercoach') {
             return <Badge className="bg-blue-100 text-blue-800">Actif</Badge>;
        }
        if (user.status === 'expired' || (user.expires_at && isPast(parseISO(user.expires_at)))) {
            return <Badge variant="destructive">Expiré</Badge>;
        }
        if (user.expires_at && differenceInDays(parseISO(user.expires_at), new Date()) <= 7) {
            return <Badge className="bg-yellow-100 text-yellow-800">Expire bientôt</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    };

    return (
        <>
            <Helmet>
                <title>Gestion des Utilisateurs - Souveniirs Formation</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="max-w-7xl mx-auto p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">Gérez les comptes des élèves et des coachs.</p>
                            </div>
                            <Button onClick={() => setAddUserModalOpen(true)} className="w-full md:w-auto">
                                <UserPlus className="h-4 w-4 mr-2" /> Ajouter un utilisateur
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between space-y-4 md:space-y-0">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')} className="text-xs sm:text-sm">Tous</Button>
                                        <Button variant={filter === 'student' ? 'secondary' : 'ghost'} onClick={() => setFilter('student')} className="text-xs sm:text-sm">Élèves</Button>
                                        <Button variant={filter === 'coach' ? 'secondary' : 'ghost'} onClick={() => setFilter('coach')} className="text-xs sm:text-sm">Coachs</Button>
                                    </div>
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Rechercher par nom ou email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Version Desktop */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Nom</th>
                                                <th scope="col" className="px-6 py-3">Email</th>
                                                <th scope="col" className="px-6 py-3">Statut</th>
                                                <th scope="col" className="px-6 py-3">Mot de passe / Code</th>
                                                <th scope="col" className="px-6 py-3">Expiration</th>
                                                <th scope="col" className="px-6 py-3">Accès</th>
                                                <th scope="col" className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-blue-600 font-semibold text-xs">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-medium">{user.name}</div>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {user.role === 'coach' && <Badge variant="outline" className="text-xs">Coach</Badge>}
                                                                    {user.role === 'supercoach' && <Badge className="bg-purple-100 text-purple-800 text-xs">Supercoach</Badge>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="truncate text-sm">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                                                    <td className="px-6 py-4">
                                                        {user.password_changed ? (
                                                            (user.role === 'coach' || user.role === 'supercoach') ? (
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="font-mono text-xs">{visiblePasswords[user.id] ? user.password : '************'}</span>
                                                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(user.id)}>
                                                                        {visiblePasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.password, 'Mot de passe')}>
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="italic text-gray-500 text-xs">Personnalisé</span>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => regeneratePassword(user.id)}>
                                                                        <RefreshCw className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="flex items-center space-x-1">
                                                                <span className="font-mono text-xs">{visiblePasswords[user.id] ? user.temp_password : '********'}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(user.id)}>
                                                                    {visiblePasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.temp_password, 'Code d\'accès')}>
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs">{user.expires_at ? format(parseISO(user.expires_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs">{user.expires_at ? `${differenceInDays(parseISO(user.expires_at), new Date())} jours restants` : 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 border border-gray-300">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                {user.role === 'student' && (
                                                                <DropdownMenuItem onClick={() => navigate(`/coach/student/${user.id}`)}>
                                                                    <Users className="mr-2 h-4 w-4" /> Voir détails
                                                                </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleSendCredentials(user)}>
                                                                    <Mail className="mr-2 h-4 w-4" /> Envoyer identifiants
                                                                </DropdownMenuItem>
                                                                 <DropdownMenuItem onClick={() => regeneratePassword(user.id)}>
                                                                    <RefreshCw className="mr-2 h-4 w-4" /> Régénérer mot de passe
                                                                </DropdownMenuItem>
                                                                { (currentUser.role === 'supercoach' || user.role !== 'supercoach') && (
                                                                    <>
                                                                    <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>
                                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)} disabled={currentUser.id === user.id}>
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                                    </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Version Mobile */}
                                <div className="lg:hidden space-y-4">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="bg-white border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-blue-600 font-semibold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {user.role === 'coach' && <Badge variant="outline" className="text-xs">Coach</Badge>}
                                                            {user.role === 'supercoach' && <Badge className="bg-purple-100 text-purple-800 text-xs">Supercoach</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    {getStatusBadge(user)}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 border border-gray-300">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            {user.role === 'student' && (
                                                            <DropdownMenuItem onClick={() => navigate(`/coach/student/${user.id}`)}>
                                                                <Users className="mr-2 h-4 w-4" /> Voir détails
                                                            </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => handleSendCredentials(user)}>
                                                                <Mail className="mr-2 h-4 w-4" /> Envoyer identifiants
                                                            </DropdownMenuItem>
                                                             <DropdownMenuItem onClick={() => regeneratePassword(user.id)}>
                                                                <RefreshCw className="mr-2 h-4 w-4" /> Régénérer mot de passe
                                                            </DropdownMenuItem>
                                                            { (currentUser.role === 'supercoach' || user.role !== 'supercoach') && (
                                                                <>
                                                                <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Modifier
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)} disabled={currentUser.id === user.id}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                                </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            
                                            {/* Infos supplémentaires sur mobile */}
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-gray-500">Code d'accès:</span>
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        {user.password_changed ? (
                                                            (user.role === 'coach' || user.role === 'supercoach') ? (
                                                                <>
                                                                    <span className="font-mono">{visiblePasswords[user.id] ? user.password?.substring(0, 8) + '...' : '********'}</span>
                                                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => togglePasswordVisibility(user.id)}>
                                                                        {visiblePasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <span className="italic text-gray-500">Personnalisé</span>
                                                            )
                                                        ) : (
                                                            <>
                                                                <span className="font-mono">{visiblePasswords[user.id] ? user.temp_password : '********'}</span>
                                                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => togglePasswordVisibility(user.id)}>
                                                                    {visiblePasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Expiration:</span>
                                                    <div className="mt-1">
                                                        {user.expires_at ? (
                                                            <>
                                                                <div>{format(parseISO(user.expires_at), 'dd/MM/yyyy', { locale: fr })}</div>
                                                                <div className="text-gray-500">{differenceInDays(parseISO(user.expires_at), new Date())} jours restants</div>
                                                            </>
                                                        ) : (
                                                            <span>N/A</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>

                {/* Add User Modal */}
                <Dialog open={isAddUserModalOpen} onOpenChange={setAddUserModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                            <DialogDescription>Remplissez les informations ci-dessous pour créer un nouveau compte.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Adresse e-mail</Label>
                                <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                    <SelectItem value="student">Élève</SelectItem>
                                    <SelectItem value="coach">Coach</SelectItem>
                                </Select>
                            </div>
                            {newUser.role === 'student' && (
                                <div className="space-y-2">
                                    <Label htmlFor="access_duration">Durée d'accès (en mois)</Label>
                                    <Select value={String(newUser.access_duration)} onValueChange={(value) => setNewUser({ ...newUser, access_duration: Number(value) })}>
                                        {[1, 3, 6, 12, 24].map(d => <SelectItem key={d} value={String(d)}>{d} mois</SelectItem>)}
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddUserModalOpen(false)} className="w-full sm:w-auto">Annuler</Button>
                            <Button onClick={handleAddUser} className="w-full sm:w-auto">Ajouter l'utilisateur</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Modal */}
                {userToEdit && (
                    <Dialog open={isEditUserModalOpen} onOpenChange={setEditUserModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Modifier l'utilisateur</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nom complet</Label>
                                    <Input id="edit-name" value={userToEdit.name} onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Adresse e-mail</Label>
                                    <Input id="edit-email" type="email" value={userToEdit.email} onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">Rôle</Label>
                                    <Select
                                        value={userToEdit.role}
                                        onValueChange={(value) => setUserToEdit({ ...userToEdit, role: value })}
                                        disabled={userToEdit.role === 'supercoach'}
                                    >
                                        <SelectItem value="student">Élève</SelectItem>
                                        <SelectItem value="coach">Coach</SelectItem>
                                    </Select>
                                </div>
                                {userToEdit.role === 'student' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_access_duration">Nouvelle durée d'accès (en mois)</Label>
                                        <Select value={String(userToEdit.access_duration)} onValueChange={(value) => setUserToEdit({ ...userToEdit, access_duration: Number(value) })}>
                                            {[1, 3, 6, 12, 24].map(d => <SelectItem key={d} value={String(d)}>{d} mois</SelectItem>)}
                                        </Select>
                                        <p className="text-xs text-gray-500">La date d'expiration sera recalculée à partir d'aujourd'hui.</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditUserModalOpen(false)} className="w-full sm:w-auto">Annuler</Button>
                                <Button onClick={handleEditUser} className="w-full sm:w-auto">Enregistrer les modifications</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
