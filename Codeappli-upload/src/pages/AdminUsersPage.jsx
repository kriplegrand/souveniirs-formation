import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, MoreHorizontal, Search, Trash2, Edit, Copy, Eye, EyeOff, RefreshCw, Mail, UserPlus, Users, Link as LinkIcon } from 'lucide-react';
import { format, parseISO, differenceInDays, addMonths, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { sendEmail } from '@/lib/email';

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
		    // Réactiver l'utilisateur si la nouvelle date est dans le futur
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
                <main className="max-w-7xl mx-auto p-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                                <p className="text-gray-600 mt-1">Gérez les comptes des élèves et des coachs.</p>
                            </div>
                            <Button onClick={() => setAddUserModalOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" /> Ajouter un utilisateur
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>Tous</Button>
                                        <Button variant={filter === 'student' ? 'secondary' : 'ghost'} onClick={() => setFilter('student')}>Élèves</Button>
                                        <Button variant={filter === 'coach' ? 'secondary' : 'ghost'} onClick={() => setFilter('coach')}>Coachs</Button>
                                    </div>
                                    <div className="relative">
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
                                <div className="overflow-x-auto">
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
                                                            <span>{user.name}</span>
                                                            {user.role === 'coach' && <Badge variant="outline">Coach</Badge>}
                                                            {user.role === 'supercoach' && <Badge className="bg-purple-100 text-purple-800">Supercoach</Badge>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{user.email}</td>
                                                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                                                    <td className="px-6 py-4">
                                                        {user.password_changed ? (
                                                            (user.role === 'coach' || user.role === 'supercoach') ? (
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="font-mono">{visiblePasswords[user.id] ? user.password : '************'}</span>
                                                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(user.id)}>
                                                                        {visiblePasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.password, 'Mot de passe')}>
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="italic text-gray-500">Personnalisé</span>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => regeneratePassword(user.id)}>
                                                                        <RefreshCw className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="flex items-center space-x-1">
                                                                <span className="font-mono">{visiblePasswords[user.id] ? user.temp_password : '********'}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(user.id)}>
                                                                    {visiblePasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.temp_password, 'Code d\'accès')}>
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">{user.expires_at ? format(parseISO(user.expires_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</td>
                                                    <td className="px-6 py-4">{user.expires_at ? `${differenceInDays(parseISO(user.expires_at), new Date())} jours restants` : 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
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
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Élève</SelectItem>
                                        <SelectItem value="coach">Coach</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newUser.role === 'student' && (
                                <div className="space-y-2">
                                    <Label htmlFor="access_duration">Durée d'accès (en mois)</Label>
                                    <Select value={String(newUser.access_duration)} onValueChange={(value) => setNewUser({ ...newUser, access_duration: Number(value) })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 3, 6, 12, 24].map(d => <SelectItem key={d} value={String(d)}>{d} mois</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddUserModalOpen(false)}>Annuler</Button>
                            <Button onClick={handleAddUser}>Ajouter l'utilisateur</Button>
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
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Élève</SelectItem>
                                            <SelectItem value="coach">Coach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {userToEdit.role === 'student' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_access_duration">Nouvelle durée d'accès (en mois)</Label>
                                        <Select value={String(userToEdit.access_duration)} onValueChange={(value) => setUserToEdit({ ...userToEdit, access_duration: Number(value) })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {[1, 3, 6, 12, 24].map(d => <SelectItem key={d} value={String(d)}>{d} mois</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">La date d'expiration sera recalculée à partir d'aujourd'hui.</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditUserModalOpen(false)}>Annuler</Button>
                                <Button onClick={handleEditUser}>Enregistrer les modifications</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}