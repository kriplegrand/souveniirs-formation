import React, { useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import Navigation from '@/components/Navigation';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { 
      Users, 
      BookOpen, 
      TrendingUp, 
      UserPlus,
      AlertTriangle
    } from 'lucide-react';
    import { subMonths, isAfter, isBefore, addDays } from 'date-fns';

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
            <main className="max-w-7xl mx-auto p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord {user.role === 'supercoach' ? 'Supercoach' : 'Coach'}</h1>
                    <Link to="/admin/users">
                      <Button><UserPlus className="h-4 w-4 mr-2" />Ajouter un élève</Button>
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, index) => (
                     <Card key={index}>
                      <CardContent className="p-6 flex items-center space-x-4">
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-gray-600">{stat.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Activité Récente</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-center py-8">La section d'activité récente sera bientôt disponible.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Raccourcis</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                           <Link to="/admin/users">
                             <Button variant="outline" className="w-full h-24 flex-col">
                               <Users className="h-6 w-6 mb-2" />
                               Gérer les Utilisateurs
                             </Button>
                           </Link>
                           <Link to="/admin/content">
                             <Button variant="outline" className="w-full h-24 flex-col">
                               <BookOpen className="h-6 w-6 mb-2" />
                               Gérer le Contenu
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