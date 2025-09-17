import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  FileText, 
  Save, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Edit3,
  X
} from 'lucide-react';

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

export default function ChaptersPage() {
  const { user, getActiveModules } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [documentLink, setDocumentLink] = useState('');

  const loadChapters = useCallback(() => {
    const activeModules = getActiveModules();
    
    // 1. Get the authoritative structure from the course data
    const courseStructure = activeModules.flatMap(module => 
      (module.lessons || []).map(lesson => ({
        id: lesson.id,
        title: lesson.title, // This is the dynamic, up-to-date title
        description: `Chapitre correspondant à la leçon "${lesson.title}"`,
        moduleTitle: module.title
      }))
    );
    
    // 2. Get the saved progress data for the user
    const savedChaptersData = localStorage.getItem(`user_chapters_${user.id}`);
    const savedDataMap = new Map();
    if(savedChaptersData) {
      try {
        JSON.parse(savedChaptersData).forEach(chap => savedDataMap.set(chap.id, chap));
      } catch (e) {
        console.error("Failed to parse user chapters data", e)
      }
    }

    // 3. Merge the two: use the structure from the course, and apply saved user data
    const synchronizedChapters = courseStructure.map(chapterFromCourse => {
      const savedUserData = savedDataMap.get(chapterFromCourse.id);
      return {
        ...chapterFromCourse, // Base with correct title and structure
        documentLink: savedUserData?.documentLink || '', // Apply saved data
        status: savedUserData?.status || 'not_started',
        updatedAt: savedUserData?.updatedAt || null,
      };
    });

    setChapters(synchronizedChapters);
  }, [user.id, getActiveModules]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const saveChaptersToStorage = (updatedChapters) => {
    // Only save the user-specific data, not the whole chapter object
    const chaptersToSave = updatedChapters
      .filter(c => c.documentLink || c.status !== 'not_started')
      .map(c => ({
        id: c.id,
        documentLink: c.documentLink,
        status: c.status,
        updatedAt: c.updatedAt
      }));
    localStorage.setItem(`user_chapters_${user.id}`, JSON.stringify(chaptersToSave));
  }

  const handleSaveChapter = (chapterId) => {
    if (!documentLink.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un lien vers votre document",
        variant: "destructive"
      });
      return;
    }

    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          documentLink: documentLink.trim(),
          status: 'in_progress',
          updatedAt: new Date().toISOString()
        };
      }
      return chapter;
    });

    setChapters(updatedChapters);
    saveChaptersToStorage(updatedChapters);
    
    setEditingChapterId(null);
    setDocumentLink('');
    
    toast({
      title: "Chapitre sauvegardé !",
      description: "Votre lien a été enregistré avec succès."
    });
  };

  const handleStartEditing = (chapter) => {
    setEditingChapterId(chapter.id);
    setDocumentLink(chapter.documentLink || '');
  };

  const handleCancelEditing = () => {
    setEditingChapterId(null);
    setDocumentLink('');
  };

  const handleMarkAsCompleted = (chapterId) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        if (!chapter.documentLink) {
           toast({
            title: "Action requise",
            description: "Veuillez d'abord ajouter un lien de document avant de marquer comme terminé.",
            variant: "destructive"
          });
          return chapter;
        }
        return {
          ...chapter,
          status: 'completed',
          updatedAt: new Date().toISOString()
        };
      }
      return chapter;
    });

    if (chapters.find(c => c.id === chapterId)?.documentLink) {
        setChapters(updatedChapters);
        saveChaptersToStorage(updatedChapters);
        toast({
          title: "Chapitre terminé !",
          description: "Félicitations pour avoir terminé ce chapitre !"
        });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border border-green-200">Terminé</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">En cours</Badge>;
      default:
        return <Badge variant="secondary">Non commencé</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const completedCount = chapters.filter(c => c.status === 'completed').length;
  const inProgressCount = chapters.filter(c => c.status === 'in_progress').length;

  return (
    <>
      <Helmet>
        <title>Mes Chapitres - Souveniirs Formation</title>
        <meta name="description" content="Gérez vos chapitres d'autobiographie et suivez votre progression de rédaction." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Mes Chapitres</CardTitle>
                <CardDescription>
                  Organisez et suivez la rédaction de votre autobiographie. Chaque chapitre correspond à une leçon du cours.
                </CardDescription>
                <div className="flex items-center space-x-6 text-sm pt-4">
                  <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500"/><span>{completedCount} terminés</span></div>
                  <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-blue-500"/><span>{inProgressCount} en cours</span></div>
                  <div className="flex items-center space-x-2"><FileText className="h-4 w-4 text-gray-400"/><span>{chapters.length - completedCount - inProgressCount} non commencés</span></div>
                </div>
              </CardHeader>
            </Card>

            {chapters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapters.map((chapter) => (
                    <motion.div key={chapter.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="pt-1">{getStatusIcon(chapter.status)}</div>
                              <div>
                                <CardTitle className="text-lg">{chapter.title}</CardTitle>
                                <CardDescription>{chapter.moduleTitle}</CardDescription>
                              </div>
                            </div>
                            {getStatusBadge(chapter.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                        {editingChapterId === chapter.id ? (
                            <div className="space-y-4">
                            <div>
                                <Label htmlFor={`link-${chapter.id}`}>Lien vers votre document (ex: Google Docs)</Label>
                                <Input id={`link-${chapter.id}`} type="url" placeholder="https://docs.google.com/document/..." value={documentLink} onChange={(e) => setDocumentLink(e.target.value)} className="mt-1" />
                            </div>
                            <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleSaveChapter(chapter.id)}><Save className="h-4 w-4 mr-2" />Sauvegarder</Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEditing}><X className="h-4 w-4 mr-2" />Annuler</Button>
                            </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {chapter.documentLink ? (
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                <a href={chapter.documentLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                                    <span className="text-sm text-blue-600 truncate flex-1 mr-2 group-hover:underline">{chapter.documentLink}</span>
                                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600" />
                                </a>
                                {chapter.updatedAt && <p className="text-xs text-gray-500 mt-1">Mis à jour le {new Date(chapter.updatedAt).toLocaleDateString('fr-FR')}</p>}
                                </div>
                            ) : (<p className="text-sm text-gray-500 italic">Aucun document associé. Ajoutez un lien pour commencer.</p>)}
                            <div className="flex space-x-2 pt-2">
                                <Button size="sm" variant="outline" onClick={() => handleStartEditing(chapter)}><Edit3 className="h-4 w-4 mr-2" />{chapter.documentLink ? 'Modifier le lien' : 'Ajouter un lien'}</Button>
                                {chapter.status !== 'completed' && (
                                <Button size="sm" onClick={() => handleMarkAsCompleted(chapter.id)}><CheckCircle className="h-4 w-4 mr-2" />Marquer comme terminé</Button>
                                )}
                            </div>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                    </motion.div>
                ))}
                </div>
            ) : (
                <Card><CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun chapitre à afficher</h3>
                    <p className="text-gray-600 max-w-md mx-auto">Les chapitres sont générés à partir des leçons du cours. Le coach n'a pas encore ajouté de leçons actives. Revenez plus tard !</p>
                </CardContent></Card>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
}
