import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from '../components/Navigation.jsx';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { subMonths, isAfter, isBefore, addDays } from 'date-fns';

// Composants UI simplifiés
const Button = ({ children, variant = 'default', className = '', ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50'
    };
    const sizeClass = className.includes('w-full h-24 flex-col') ? 'w-full h-24 flex-col' : 'h-10 py-2 px-4';
    
    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }) => (
    <div className={`flex flex-col space-y-1.5 p-4 sm:p-6 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-4 pt-0 sm:p-6 sm:pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg sm:text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

export default function CoachDashboard() {
  const { user, users, checkExpirations } = useAuth();

  const currentUsers = useMemo(() => {
    if (typeof checkExpirations === 'function') {
      return checkExpirations(users);
    }
    return users;
  }, [users, checkExpirations]);

  const stats = useMemo(() => {
    const students = currentUsers.filter(u => u.role === 'student');
    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);
    const sevenDaysLater = addDays(now, 7);

    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    const expiringSoon = students.filter(s => 
      s.status === 'active' &&
      s.expires_at &&
      isBefore(new Date(s.expires_at), sevenDaysLater) &&
      isAfter(new Date(s.expires_at), now)
    ).length;
    const newThisMonth = students.filter(s => s.created_at && isAfter(new Date(s.created_at), oneMonthAgo)).length;

    return { total, active, expiringSoon, newThisMonth };
  }, [currentUsers]);
  
  const statCards = [
    { title: 'Élèves Total', value: stats.total, icon: Users, color: 'text-blue-500' },
    { title: 'Élèves Actifs', value: stats.active, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Expire Bientôt', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-orange-500' },
    { title: 'Nouveaux ce mois-ci', value: stats.newThisMonth, icon: UserPlus, color: 'text-purple-500' }
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de Bord Coach - Souveniirs Formation</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Tableau de Bord {user.role === 'supercoach' ? 'Supercoach' : 'Coach'}
                </h1>
                <Link to="/admin/users">
                  <Button className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un élève
                  </Button>
                </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => (
                 <Card key={index}>
                  <CardContent className="p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                      <CardTitle>Activité Récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                          La section d'activité récente sera bientôt disponible.
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                      <CardTitle>Raccourcis</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Link to="/admin/users">
                         <Button variant="outline" className="w-full h-20 sm:h-24 flex-col">
                           <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                           <span className="text-xs sm:text-sm text-center">Gérer les Utilisateurs</span>
                         </Button>
                       </Link>
                       <Link to="/admin/content">
                         <Button variant="outline" className="w-full h-20 sm:h-24 flex-col">
                           <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                           <span className="text-xs sm:text-sm text-center">Gérer le Contenu</span>
                         </Button>
                       </Link>
                    </CardContent>
                </Card>
            </div>

          </motion.div>
        </main>
      </div>
    </>
  );
}
