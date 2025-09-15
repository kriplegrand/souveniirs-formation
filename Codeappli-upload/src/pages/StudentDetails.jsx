import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, BookOpen, FileText, CheckCircle, Clock, ExternalLink, Calendar, User, Mail, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

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