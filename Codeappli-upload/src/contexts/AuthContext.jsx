import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialUsers, initialModules } from '../lib/data.js';
import { differenceInDays, isPast, parseISO } from 'date-fns';
import { sendEmail } from '../lib/email.js';

// Note: Le toast est temporairement commenté car nous n'avons pas encore de système de toast
// import { toast } from '../components/ui/use-toast';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction toast temporaire en attendant l'implémentation du système de toast
  const toast = (options) => {
    console.log('Toast:', options.title, '-', options.description);
    // Ici vous pourrez plus tard implémenter un vrai système de notifications
  };

  const checkExpirations = useCallback((currentUsers) => {
    let usersUpdated = false;
    const updatedUsers = currentUsers.map(u => {
      if (u.role === 'student' && u.status === 'active' && u.expires_at) {
        const expirationDate = parseISO(u.expires_at);
        if (isPast(expirationDate)) {
          u.status = 'expired';
          usersUpdated = true;
          sendEmail({
            to: u.email,
            template: 'access_expired',
            data: u,
          });
        }
      }
      return u;
    });

    if (usersUpdated) {
      localStorage.setItem('souveniirs_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    }
    return currentUsers;
  }, []);

  const initializeData = useCallback(() => {
    setIsLoading(true);
    try {
      let storedUsers = JSON.parse(localStorage.getItem('souveniirs_users'));
      if (!storedUsers || storedUsers.length === 0) {
        storedUsers = initialUsers;
        localStorage.setItem('souveniirs_users', JSON.stringify(storedUsers));
      }
      
      const usersWithCheckedExpirations = checkExpirations(storedUsers);
      setUsers(usersWithCheckedExpirations);

      let storedModules = JSON.parse(localStorage.getItem('souveniirs_modules'));
      if (!storedModules || storedModules.length === 0) {
        storedModules = initialModules;
        localStorage.setItem('souveniirs_modules', JSON.stringify(storedModules));
      }
      setModules(storedModules);

      const loggedInUser = JSON.parse(localStorage.getItem('souveniirs_user'));
      if (loggedInUser) {
        const fullUser = usersWithCheckedExpirations.find(u => u.id === loggedInUser.id);
        if (fullUser) {
          setUser(fullUser);
           if (fullUser.role === 'student' && fullUser.status === 'active' && fullUser.expires_at) {
            const daysUntilExpiry = differenceInDays(parseISO(fullUser.expires_at), new Date());
            if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
              toast({
                title: 'Alerte d\'expiration',
                description: `Votre accès expire dans ${daysUntilExpiry} jour(s).`,
                variant: 'destructive',
              });
              if (daysUntilExpiry === 7) {
                sendEmail({
                  to: fullUser.email,
                  template: 'expiry_soon',
                  data: fullUser
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [checkExpirations]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const login = (email, password) => {
    const userToLogin = users.find(u => u.email === email);

    if (userToLogin) {
      const isPasswordCorrect = userToLogin.password_changed 
        ? userToLogin.password === password 
        : userToLogin.temp_password === password;

      if (isPasswordCorrect) {
        if (userToLogin.status === 'disabled') {
            toast({
                title: 'Compte désactivé',
                description: 'Votre compte a été désactivé. Veuillez contacter le support.',
                variant: 'destructive',
            });
            return false;
        }

        setUser(userToLogin);
        localStorage.setItem('souveniirs_user', JSON.stringify(userToLogin));
        
        if (userToLogin.role === 'student' && userToLogin.status === 'active' && userToLogin.expires_at) {
            const daysUntilExpiry = differenceInDays(parseISO(userToLogin.expires_at), new Date());
            if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
                toast({
                    title: 'Alerte d\'expiration',
                    description: `Votre accès expire dans ${daysUntilExpiry} jour(s).`,
                    variant: 'destructive',
                });
            }
        }

        return true;
      }
    }

    toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect.',
        variant: 'destructive',
    });
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('souveniirs_user');
  };

  const updateUser = (userId, updatedData) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updatedData } : u);
    setUsers(updatedUsers);
    localStorage.setItem('souveniirs_users', JSON.stringify(updatedUsers));
    if (user && user.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      setUser(updatedCurrentUser);
      localStorage.setItem('souveniirs_user', JSON.stringify(updatedCurrentUser));
    }
    return updatedUsers.find(u => u.id === userId);
  };
  
  const changePassword = (userId, newPassword, fromProfile = false, currentPassword = null) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return false;

    if (fromProfile) {
        const isCurrentPasswordCorrect = userToUpdate.password_changed
            ? userToUpdate.password === currentPassword
            : userToUpdate.temp_password === currentPassword;

        if (!isCurrentPasswordCorrect) {
            toast({ title: "Erreur", description: "Le mot de passe actuel est incorrect.", variant: "destructive" });
            return false;
        }
    }

    const updatedData = {
      password: newPassword,
      password_changed: true,
      first_login: false,
      temp_password: '',
    };
    updateUser(userId, updatedData);
    toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
    return true;
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'active',
      first_login: userData.role === 'student',
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('souveniirs_users', JSON.stringify(updatedUsers));
    
    sendEmail({
      to: newUser.email,
      template: newUser.role === 'coach' ? 'welcome_coach' : 'welcome_student',
      data: newUser,
    });
    
    return newUser;
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('souveniirs_users', JSON.stringify(updatedUsers));
  };
  
  const getActiveModules = () => {
    return modules.filter(m => m.is_active);
  };
  
  const updateModule = (moduleId, updatedData) => {
    const updatedModules = modules.map(m => m.id === moduleId ? { ...m, ...updatedData } : m);
    setModules(updatedModules);
    localStorage.setItem('souveniirs_modules', JSON.stringify(updatedModules));
  };

  const updateCourseContent = (updatedModules) => {
    setModules(updatedModules);
    localStorage.setItem('souveniirs_modules', JSON.stringify(updatedModules));
  };

  const value = {
    user,
    users,
    modules,
    isLoading,
    login,
    logout,
    updateUser,
    addUser,
    deleteUser,
    getActiveModules,
    updateModule,
    updateCourseContent,
    checkExpirations,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
