import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ArrowLeft, BookOpen, FileText, CheckCircle, Clock, ExternalLink, Calendar, User, Mail, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const Badge = ({ className = "", variant = "default", ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80 bg-blue-600 text-white",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80 bg-red-600 text-white",
    outline: "text-foreground border border-gray-300 text-gray-900"
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} {...props} />
  );
};

const Progress = ({ value = 0, className = "", ...props }) => (
  <div className={`relative w-full overflow-hidden rounded-full bg-secondary bg-gray-200 ${className}`} {...props}>
    <div
      className="h-full w-full flex-1 bg-primary transition-all bg-blue-600"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

export default function StudentDetails() {
  const { studentId } = useParams();
  const { users, getActiveModules } = useAuth();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState({
    lessons: [],
    chapters: [],
    lessonProgress: 0,
    chapterProgress: 0,
    completedLessonsCount: 0,
    totalLessons: 0,
    completedChaptersCount: 0,
    inProgressChaptersCount: 0,
    totalChapters: 0
  });

  useEffect(() => {
    // Correction: Comparaison flexible des IDs pour gérer les formats string et number
    const studentData = users.find(u => String(u.id) === String(studentId));
    setStudent(studentData);

    if (studentData) {
      const activeModules = getActiveModules();
      const allLessons = activeModules.flatMap(m => m.lessons || []).sort((a, b) => a.order_index - b.order_index);
      const totalLessons = allLessons.length;
      const totalChapters = totalLessons;

      // Lesson progress
      const savedLessons = localStorage.getItem(`completed_lessons_${studentData.id}`);
      const completedLessonIds = savedLessons ? new Set(JSON.parse(savedLessons)) : new Set();
      const lessons = allLessons.map(l => ({
        ...l,
        completed: completedLessonIds.has(l.id)
      }));
      const completedLessonsCount = completedLessonIds.size;
      const lessonProgress = totalLessons > 0 ? Math.round(completedLessonsCount / totalLessons * 100) : 0;

      // Chapter progress
      const savedChapters = localStorage.getItem(`user_chapters_${studentData.id}`);
      const chapterData = savedChapters ? JSON.parse(savedChapters) : [];
      const chapters = allLessons.map(l => {
        const userChapter = chapterData.find(c => c.lessonId === l.id);
        return {
          ...l,
          status: userChapter?.status || 'not_started',
          link: userChapter?.link || '',
          updatedAt: userChapter?.updated_at || null
        };
      });
      const completedChaptersCount = chapters.filter(c => c.status === 'completed').length;
      const inProgressChaptersCount = chapters.filter(c => c.status === 'in_progress').length;
      const chapterProgress = totalChapters > 0 ? Math.round(completedChaptersCount / totalChapters * 100) : 0;

      setProgress({
        lessons,
        chapters,
        lessonProgress,
        chapterProgress,
        completedLessonsCount,
        totalLessons,
        completedChaptersCount,
        inProgressChaptersCount,
        totalChapters
      });
    }
  }, [studentId, users, getActiveModules]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Élève non trouvé</h2>
              <p className="text-gray-600 mb-4">L'élève demandé n'existe pas ou n'est pas accessible.</p>
              <Link to="/coach">
                <Button>Retour au tableau de bord</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getChapterStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="secondary">Non commencé</Badge>;
    }
  };

  const getChapterStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (student.status === 'expired') return <Badge variant="destructive">Expiré</Badge>;
    if (student.status === 'disabled') return <Badge variant="destructive">Désactivé</Badge>;
    if (student.expires_at && isPast(new Date(student.expires_at))) return <Badge variant="destructive">Expiré</Badge>;
    return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>{student.name} - Détails Élève - Souveniirs Formation</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-6xl mx-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <Link to="/admin/users">
                  <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-xl">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                     <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                     {getStatusBadge()}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1"><Mail className="h-4 w-4" /><span>{student.email}</span></div>
                    <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>Inscrit le {format(new Date(student.created_at), 'dd/MM/yyyy')}</span></div>
                    {student.expires_at && <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>Expire {formatDistanceToNow(new Date(student.expires_at), { addSuffix: true, locale: fr })}</span></div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center space-x-2"><BookOpen className="h-5 w-5" /><span>Progression des Leçons</span></CardTitle></CardHeader>
                <CardContent>
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span>Progression globale</span><span>{progress.lessonProgress}%</span></div>
                      <Progress value={progress.lessonProgress} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1">{progress.completedLessonsCount} sur {progress.totalLessons} leçons terminées</p>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center space-x-2"><FileText className="h-5 w-5" /><span>Progression de la Rédaction</span></CardTitle></CardHeader>
                <CardContent>
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span>Progression globale</span><span>{progress.chapterProgress}%</span></div>
                      <Progress value={progress.chapterProgress} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1">{progress.completedChaptersCount} terminés, {progress.inProgressChaptersCount} en cours</p>
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Détail des Leçons</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {progress.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                        </div>
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Détail des Chapitres</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {progress.chapters.map(chapter => (
                    <div key={chapter.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getChapterStatusIcon(chapter.status)}
                          <span className="text-sm font-medium">{chapter.title}</span>
                        </div>
                        {getChapterStatusBadge(chapter.status)}
                      </div>
                      {chapter.link && (
                        <div className="flex items-center justify-between mt-2 p-2 bg-white rounded border">
                          <span className="text-xs text-gray-600 truncate flex-1 mr-2">{chapter.link}</span>
                          <a href={chapter.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                      {chapter.updatedAt && <p className="text-xs text-gray-500 mt-1">Mis à jour le {format(new Date(chapter.updatedAt), 'dd/MM/yyyy')}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
