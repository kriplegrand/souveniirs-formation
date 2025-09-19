import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from '../components/Navigation.jsx';
import { 
  Download, 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Pie } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, addMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composants UI simplifiés pour le déploiement
const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '' }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50'
    };
    const sizes = {
        default: 'h-10 py-2 px-4',
        icon: 'h-10 w-10',
        sm: 'h-8 px-3 text-sm'
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

const CardDescription = ({ children, className = '' }) => (
    <p className={`text-xs sm:text-sm text-gray-600 ${className}`}>{children}</p>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const { users, getActiveModules } = useAuth();

  const analyticsData = useMemo(() => {
    const students = users.filter(u => u.role === 'student');
    const paidStudents = students.filter(s => s.payment_status === 'paid');
    const allLessons = getActiveModules().flatMap(m => m.lessons || []);
    const now = new Date();

    // 1. Monthly Revenue & New Students
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, 5 - i);
      const monthName = format(date, 'MMM', { locale: fr });
      const interval = { start: startOfMonth(date), end: endOfMonth(date) };
      
      const newStudentsThisMonth = students.filter(s => isWithinInterval(new Date(s.created_at), interval));
      const newPaidStudentsThisMonth = newStudentsThisMonth.filter(s => s.payment_status === 'paid');
      
      const revenue = newPaidStudentsThisMonth.reduce((acc, student) => {
        return acc + (student.amount_paid || 0);
      }, 0);

      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        'Nouveaux élèves': newStudentsThisMonth.length,
        'Revenus (€)': revenue,
      };
    });

    // 2. Average Progression Rate (All students)
    let totalProgress = 0;
    let studentCountWithProgress = 0;
    students.forEach(student => {
      const saved = localStorage.getItem(`completed_lessons_${student.id}`);
      if (saved) {
        const completed = JSON.parse(saved);
        if (allLessons.length > 0) {
          totalProgress += (completed.length / allLessons.length) * 100;
          studentCountWithProgress++;
        }
      }
    });
    const averageProgression = studentCountWithProgress > 0 ? Math.round(totalProgress / studentCountWithProgress) : 0;

    // 3. Lesson Popularity (All students)
    const lessonCompletions = new Map();
    allLessons.forEach(lesson => lessonCompletions.set(lesson.id, 0));

    students.forEach(student => {
      const saved = localStorage.getItem(`completed_lessons_${student.id}`);
      if (saved) {
        const completed = JSON.parse(saved);
        completed.forEach(lessonId => {
          if (lessonCompletions.has(lessonId)) {
            lessonCompletions.set(lessonId, lessonCompletions.get(lessonId) + 1);
          }
        });
      }
    });

    const lessonPopularity = Array.from(lessonCompletions.entries())
      .map(([id, completions]) => ({
        name: allLessons.find(l => l.id === id)?.title || `Leçon ${id}`,
        completions,
      }))
      .sort((a, b) => b.completions - a.completions);

    const topLessons = lessonPopularity.slice(0, 5);
    const bottomLessons = lessonPopularity.slice(-5).reverse();

    // 4. Upcoming Expirations (Paid students)
    const nextMonth = addMonths(now, 1);
    const expiringSoonStudents = paidStudents.filter(s => 
      s.expires_at && isWithinInterval(new Date(s.expires_at), { start: now, end: nextMonth })
    );
    const revenueAtRisk = expiringSoonStudents.reduce((acc, student) => {
      return acc + (student.amount_paid || 0);
    }, 0);

    return { monthlyData, averageProgression, topLessons, bottomLessons, revenueAtRisk, expiringSoonCount: expiringSoonStudents.length };
  }, [users, getActiveModules]);

  const handleExport = () => {
    const students = users.filter(u => u.role === 'student');
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nom,Email,Statut,Statut Paiement,Montant Payé,Date d'inscription,Date d'expiration\n";

    students.forEach(student => {
      const row = [
        student.id,
        `"${student.name}"`,
        student.email,
        student.status,
        student.payment_status || 'n/a',
        student.amount_paid || 0,
        format(new Date(student.created_at), 'yyyy-MM-dd'),
        student.expires_at ? format(new Date(student.expires_at), 'yyyy-MM-dd') : 'N/A',
      ].join(',');
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_eleves_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Analytics - Souveniirs Formation</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
              <Button onClick={handleExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{analyticsData.averageProgression}%</div>
                        <p className="text-xs text-gray-500">Taux de complétion moyen (tous les élèves)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus à Risque (30j)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{analyticsData.revenueAtRisk.toLocaleString('fr-FR')} €</div>
                        <p className="text-xs text-gray-500">{analyticsData.expiringSoonCount} élèves payants expirent bientôt</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{users.filter(u => u.role === 'student').length}</div>
                        <p className="text-xs text-gray-500">Nombre total d'élèves inscrits</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 flex-shrink-0" />
                  <span className="text-base sm:text-2xl">Revenus et Inscriptions Mensuels</span>
                </CardTitle>
                <CardDescription>Basé sur les 6 derniers mois. Revenus basés sur les élèves payants.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] lg:min-w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Revenus (€)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Nouveaux élèves', angle: 90, position: 'insideRight' }} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value, name) => [typeof value === 'number' ? value.toLocaleString('fr-FR') : value, name]} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Revenus (€)" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="Nouveaux élèves" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-base sm:text-xl">Top 5 Leçons les Plus Suivies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[400px]">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.topLessons} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="completions" name="Complétions" fill={COLORS[1]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="mr-2 text-red-500 flex-shrink-0" />
                    <span className="text-base sm:text-xl">Top 5 Leçons les Moins Suivies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[400px]">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.bottomLessons} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="completions" name="Complétions" fill={COLORS[3]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
