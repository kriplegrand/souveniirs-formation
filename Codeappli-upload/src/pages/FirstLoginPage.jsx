import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.js';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

// Fonction toast temporaire
const toast = (options) => {
    console.log('Toast:', options.title, '-', options.description);
};

// Composants UI simplifiés
const Button = ({ children, onClick, type = 'button', className = '', disabled = false }) => (
    <button 
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 ${className}`}
    >
        {children}
    </button>
);

const Input = ({ value, onChange, placeholder, className = '', type = 'text', id, required = false }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
);

const Label = ({ children, htmlFor, className = '' }) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);

const Card = ({ children, className = '' }) => (
    <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

export default function FirstLoginPage() {
    const { user, changePassword } = useAuth();
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push("au moins 8 caractères");
        if (!/[A-Z]/.test(password)) errors.push("au moins une majuscule");
        if (!/[0-9]/.test(password)) errors.push("au moins un chiffre");
        return errors.length > 0 ? `Le mot de passe doit contenir ${errors.join(', ')}.` : '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (user.temp_password !== tempPassword) {
            toast({ title: "Erreur", description: "Le code d'accès temporaire est incorrect.", variant: "destructive" });
            return;
        }

        const error = validatePassword(newPassword);
        if (error) {
            setPasswordError(error);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }
        
        setPasswordError('');
        setIsLoading(true);

        try {
            changePassword(user.id, newPassword);
        } catch (error) {
            toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Première Connexion - Souveniirs Formation</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-xl">
                        <CardHeader className="text-center">
                            <div className="flex justify-center"><div className="p-3 bg-blue-100 rounded-full"><KeyRound className="h-8 w-8 text-blue-600" /></div></div>
                            <CardTitle>Première connexion</CardTitle>
                            <CardDescription>Pour votre sécurité, veuillez changer votre code d'accès temporaire.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tempPassword">Code d'accès temporaire</Label>
                                    <Input id="tempPassword" type="password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                </div>
                                {passwordError && (
                                    <div className="text-red-600 text-sm flex items-center space-x-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>{passwordError}</span>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 space-y-1 pt-2">
                                    <p className="flex items-center"><CheckCircle className={`h-4 w-4 mr-2 ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} /> Au moins 8 caractères</p>
                                    <p className="flex items-center"><CheckCircle className={`h-4 w-4 mr-2 ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`} /> Au moins une majuscule</p>
                                    <p className="flex items-center"><CheckCircle className={`h-4 w-4 mr-2 ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`} /> Au moins un chiffre</p>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Modification..." : "Changer le mot de passe"}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}
