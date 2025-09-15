import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { User, KeyRound, Save } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser, changePassword } = useAuth();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        updateUser(user.id, { name, email });
        toast({ title: "Succès", description: "Vos informations ont été mises à jour." });
    };
    
    const handlePasswordChange = (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas.", variant: "destructive" });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: "Erreur", description: "Le nouveau mot de passe doit faire au moins 8 caractères.", variant: "destructive" });
            return;
        }

        const success = changePassword(user.id, newPassword, true, currentPassword);

        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <>
            <Helmet><title>Mon Profil - Souveniirs Formation</title></Helmet>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="max-w-4xl mx-auto p-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><User className="mr-2" />Informations Personnelles</CardTitle>
                                <CardDescription>Mettez à jour vos informations de profil.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom complet</Label>
                                        <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Adresse email</Label>
                                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                    <Button type="submit"><Save className="mr-2 h-4 w-4"/>Sauvegarder les changements</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><KeyRound className="mr-2" />Changer le mot de passe</CardTitle>
                                <CardDescription>Pour votre sécurité, utilisez un mot de passe fort.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Mot de passe actuel</Label>
                                        <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                        <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                    </div>
                                    <Button type="submit"><Save className="mr-2 h-4 w-4"/>Changer le mot de passe</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>
            </div>
        </>
    );
}