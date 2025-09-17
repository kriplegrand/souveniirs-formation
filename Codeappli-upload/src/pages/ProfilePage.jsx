import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext.jsx';
import { User, KeyRound, Save } from 'lucide-react';

// Composants UI intégrés
const Button = React.forwardRef(({ className = "", variant = "default", size = "default", ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-red-600 text-white hover:bg-red-700",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-gray-300 hover:bg-gray-50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-gray-100",
    link: "text-primary underline-offset-4 hover:underline text-blue-600"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 focus-visible:ring-blue-500 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

const Label = ({ className = "", ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 ${className}`} {...props} />
);

const Card = ({ className = "", ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200 ${className}`} {...props} />
);

const CardHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className = "", ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight text-gray-900 ${className}`} {...props} />
);

const CardDescription = ({ className = "", ...props }) => (
  <p className={`text-sm text-muted-foreground text-gray-600 ${className}`} {...props} />
);

const CardContent = ({ className = "", ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

// Toast function simplifiée
const toast = ({ title, description, variant = "default" }) => {
  const toastEl = document.createElement('div');
  const bgColor = variant === "destructive" ? 'bg-red-600' : 'bg-green-600';
  toastEl.className = `fixed top-4 right-4 ${bgColor} text-white p-4 rounded-md shadow-lg z-50 transition-opacity`;
  toastEl.innerHTML = `<div class="font-semibold">${title}</div><div class="text-sm">${description}</div>`;
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 300);
  }, 3000);
};

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
