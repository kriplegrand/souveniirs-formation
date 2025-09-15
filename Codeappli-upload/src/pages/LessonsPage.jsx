import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  Clock,
  FileText
} from 'lucide-react';
import DOMPurify from 'dompurify';

export default function LessonsPage() {
  const { user, getActiveModules } = useAuth();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [allLessons, setAllLessons] = useState([]);
  const [activeModules, setActiveModules] = useState([]);

  useEffect(() => {
    const modules = getActiveModules();
    setActiveModules(modules);
    
    if (modules.length > 0) {
      const lessons = modules.flatMap(module => 
        (module.lessons || []).map(lesson => ({ ...lesson, moduleTitle: module.title, moduleId: module.id }))
      ).sort((a,b) => {
        const moduleA = modules.find(m => m.id === a.moduleId);
        const moduleB = modules.find(m => m.id === b.moduleId);
        if (moduleA.order_index !== moduleB.order_index) {
          return moduleA.order_index - moduleB.order_index;
        }
        return a.order_index - b.order_index;
      });
      
      setAllLessons(lessons);

      const saved = localStorage.getItem(`completed_lessons_${user.id}`);
      const completedSet = saved ? new Set(JSON.parse(saved)) : new Set();
      setCompletedLessons(completedSet);

      const lastLessonId = localStorage.getItem(`last_lesson_${user.id}`);
      const lastLesson = lessons.find(l => l.id === parseInt(lastLessonId));

      if(lastLesson) {
          setCurrentLesson(lastLesson);
      } else if (lessons.length > 0) {
        setCurrentLesson(lessons[0]);
      } else {
        setCurrentLesson(null);
      }
    } else {
        setAllLessons([]);
        setActiveModules([]);
        setCurrentLesson(null);
    }
  }, [user.id, getActiveModules]);
  
  const handleSetCurrentLesson = (lesson) => {
      setCurrentLesson(lesson);
      localStorage.setItem(`last_lesson_${user.id}`, lesson.id);
  }

  const saveProgress = (lessonIds) => {
    localStorage.setItem(`completed_lessons_${user.id}`, JSON.stringify([...lessonIds]));
  };

  const markAsCompleted = (lessonId) => {
    const newCompleted = new Set([...completedLessons, lessonId]);
    setCompletedLessons(newCompleted);
    saveProgress(newCompleted);
    
    toast({
      title: "Leçon terminée !",
      description: "Votre progression a été sauvegardée."
    });
  };

  const navigateLesson = (direction) => {
    if (allLessons.length === 0) return;
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    let newIndex;
    
    if (direction === 'next' && currentIndex < allLessons.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }
    
    handleSetCurrentLesson(allLessons[newIndex]);
  };

  const progressPercentage = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;
  const isFirstLesson = allLessons.findIndex(l => l?.id === currentLesson?.id) === 0;
  const isLastLesson = allLessons.findIndex(l => l?.id === currentLesson?.id) === allLessons.length - 1;

  return (
    <>
      <Helmet>
        <title>Mes Leçons - Souveniirs Formation</title>
        <meta name="description" content="Suivez vos leçons d'apprentissage pour rédiger votre autobiographie avec méthode et accompagnement." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        
        <div className="flex-1 lg:grid lg:grid-cols-4">
          {/* Main Content */}
          <main className="lg:col-span-3 p-6 overflow-y-auto">
            {currentLesson ? (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {currentLesson.moduleTitle}
                          </Badge>
                          <CardTitle className="text-2xl md:text-3xl">{currentLesson.title}</CardTitle>
                          <p className="text-gray-600 mt-2">{currentLesson.description}</p>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{currentLesson.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t pt-4">
                        <Button variant="outline" onClick={() => navigateLesson('prev')} disabled={isFirstLesson}>
                          <ChevronLeft className="h-4 w-4 mr-2" />Précédent
                        </Button>
                        <Button onClick={() => markAsCompleted(currentLesson.id)} disabled={completedLessons.has(currentLesson.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {completedLessons.has(currentLesson.id) ? 'Terminé' : 'Marquer comme terminé'}
                        </Button>
                        <Button variant="outline" onClick={() => navigateLesson('next')} disabled={isLastLesson}>
                          Suivant<ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-t-lg">
                      <iframe className="w-full h-full rounded-t-lg" src={currentLesson.video_url} title={currentLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-600"/>Explications et procédures</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.explanatory_text || "") }} />
                </Card>

                {(currentLesson.resources_links && currentLesson.resources_links.length > 0) && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-green-600"/>Ressources complémentaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentLesson.resources_links.map((resource, index) => (
                          <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-blue-600">{resource.title}</span>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </div>
                              {resource.description && <p className="text-sm text-gray-500 mt-1">{resource.description}</p>}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ) : (
                 <div className="text-center p-12 bg-white rounded-lg shadow-sm border h-full flex flex-col items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">Aucune leçon disponible</h2>
                    <p className="text-gray-500 mt-2 max-w-md">Le coach n'a pas encore ajouté de leçons actives. Revenez bientôt pour commencer votre aventure autobiographique !</p>
                </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white border-l border-gray-200 p-6 overflow-y-auto hidden lg:block">
            <div className="space-y-6 sticky top-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression globale</span>
                  <span className="text-sm text-gray-500">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{completedLessons.size} sur {allLessons.length} leçons terminées</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Sommaire</h3>
                <div className="space-y-4">
                  {activeModules.map((module) => (
                    <div key={module.id}>
                      <h4 className="font-medium text-gray-900 mb-2">{module.title}</h4>
                      <div className="space-y-1 ml-2 border-l-2 pl-4">
                        {(module.lessons || []).map((lesson) => (
                          <button key={lesson.id} onClick={() => handleSetCurrentLesson({ ...lesson, moduleTitle: module.title })} className={`flex items-center space-x-3 w-full text-left p-2 rounded-md transition-colors ${currentLesson?.id === lesson.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                            {completedLessons.has(lesson.id) ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                            <span className="text-sm">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                   {activeModules.length === 0 && <p className="text-sm text-gray-500 text-center">Aucun module pour le moment.</p>}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}