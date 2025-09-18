import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from '../components/Navigation.jsx';
import { Plus, Edit, Trash2, GripVertical, Link as LinkIcon, AlertTriangle } from 'lucide-react';

// Fonction toast temporaire
const toast = (options) => {
    console.log('Toast:', options.title, '-', options.description);
};

// Composants UI simplifiés pour le déploiement
const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '', type = 'button' }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700'
    };
    const sizes = {
        default: 'h-10 py-2 px-4',
        icon: 'h-10 w-10',
        sm: 'h-8 px-3 text-sm'
    };
    
    return (
        <button 
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text', id }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
);

const Label = ({ children, htmlFor, className = '' }) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);

const Textarea = ({ value, onChange, placeholder, className = '', id }) => (
    <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        rows={3}
    />
);

const Card = ({ children, className = '' }) => (
    <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }) => (
    <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => (
    <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
);

const CardDescription = ({ children }) => (
    <p className="text-sm text-gray-600">{children}</p>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-blue-100 text-blue-800',
        destructive: 'bg-red-100 text-red-800'
    };
    
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};

const Select = ({ children, value, onValueChange }) => (
    <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
        <option value="" disabled>Sélectionner un module...</option>
        {children}
    </select>
);

const SelectItem = ({ value, children }) => (
    <option value={value}>{children}</option>
);

const Switch = ({ checked, onCheckedChange, id }) => (
    <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-6 w-11 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    />
);

const Tabs = ({ children, value, onValueChange, className = '' }) => (
    <div className={`w-full ${className}`}>
        {React.Children.map(children, child => 
            React.cloneElement(child, { activeTab: value, setActiveTab: onValueChange })
        )}
    </div>
);

const TabsList = ({ children, activeTab, setActiveTab }) => (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
        {React.Children.map(children, child => 
            React.cloneElement(child, { activeTab, setActiveTab })
        )}
    </div>
);

const TabsTrigger = ({ children, value, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(value)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
            activeTab === value 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
        }`}
    >
        {children}
    </button>
);

const TabsContent = ({ children, value, activeTab }) => {
    if (activeTab !== value) return null;
    return (
        <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {children}
        </div>
    );
};

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children, className = '' }) => <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-6">{children}</div>;

// Simple text editor component to replace ReactQuill
const TextEditor = ({ value, onChange }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Saisissez le texte explicatif ici..."
        rows={6}
    />
);

const emptyModule = { title: '', description: '', order_index: 0, is_active: true };
const emptyLesson = { 
    title: '', description: '', video_url: '', duration: '', order_index: 0, 
    resources_links: [], explanatory_text: '', is_active: true, module_id: null 
};

export default function AdminContentPage() {
    const { modules, updateCourseContent } = useAuth();
    const [activeTab, setActiveTab] = useState('modules');
    const [isModuleModalOpen, setModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setLessonModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentModule, setCurrentModule] = useState(emptyModule);
    const [currentLesson, setCurrentLesson] = useState(emptyLesson);

    const handleOpenModuleModal = (module = null) => {
        setCurrentModule(module ? { ...module } : { ...emptyModule, order_index: modules.length + 1, id: null });
        setModuleModalOpen(true);
    };

    const handleOpenLessonModal = (lesson = null, moduleId = null) => {
        if (lesson) {
            setCurrentLesson({ ...lesson });
        } else {
            const parentModule = modules.find(m => m.id === moduleId);
            setCurrentLesson({ ...emptyLesson, module_id: moduleId, order_index: parentModule && parentModule.lessons ? parentModule.lessons.length + 1 : 1, id: null });
        }
        setLessonModalOpen(true);
    };

    const handleSaveModule = () => {
        let updatedModules;
        if (currentModule.id) {
            updatedModules = modules.map(m => m.id === currentModule.id ? currentModule : m);
        } else {
            const newModule = { ...currentModule, id: Date.now(), lessons: [] };
            updatedModules = [...modules, newModule];
        }
        updatedModules.sort((a, b) => a.order_index - b.order_index);
        updateCourseContent(updatedModules);
        setModuleModalOpen(false);
    };

    const handleSaveLesson = () => {
        if (!currentLesson.module_id) {
            toast({ title: "Erreur", description: "Veuillez sélectionner un module.", variant: "destructive" });
            return;
        }

        const targetModuleId = parseInt(currentLesson.module_id, 10);
        let lessonSaved = false;

        const updatedModules = modules.map(m => {
            // Remove lesson from old module if it's being moved
            if (currentLesson.id) {
                 m.lessons = (m.lessons || []).filter(l => l.id !== currentLesson.id);
            }

            if (m.id === targetModuleId || m.id.toString() === currentLesson.module_id) {
                let newLessons;
                const lessonToSave = { ...currentLesson, module_id: targetModuleId };

                if (lessonToSave.id) { // Existing lesson
                    newLessons = [...(m.lessons || []), lessonToSave];
                } else { // New lesson
                    const newLessonWithId = { ...lessonToSave, id: Date.now() };
                    newLessons = [...(m.lessons || []), newLessonWithId];
                }
                newLessons.sort((a,b) => a.order_index - b.order_index);
                lessonSaved = true;
                return { ...m, lessons: newLessons };
            }
            return m;
        });

        updateCourseContent(updatedModules);
        setLessonModalOpen(false);
    };

    const openDeleteConfirmation = (type, id, parentId = null) => {
        setItemToDelete({ type, id, parentId });
        setDeleteModalOpen(true);
    };
    
    const handleDelete = () => {
        if (!itemToDelete) return;
        const { type, id, parentId } = itemToDelete;
        let updatedModules;

        if (type === 'module') {
            updatedModules = modules.filter(m => m.id !== id);
        } else if (type === 'lesson') {
            updatedModules = modules.map(m => {
                if (m.id === parentId) {
                    return { ...m, lessons: (m.lessons || []).filter(l => l.id !== id) };
                }
                return m;
            });
        }
        updateCourseContent(updatedModules);
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleAddResourceLink = () => {
        setCurrentLesson(prev => ({
            ...prev,
            resources_links: [...(prev.resources_links || []), { title: '', url: '', description: '' }]
        }));
    };

    const handleRemoveResourceLink = (index) => {
        setCurrentLesson(prev => ({
            ...prev,
            resources_links: prev.resources_links.filter((_, i) => i !== index)
        }));
    };
    
    const handleResourceLinkChange = (index, field, value) => {
        const newLinks = [...currentLesson.resources_links];
        newLinks[index][field] = value;
        setCurrentLesson(prev => ({ ...prev, resources_links: newLinks }));
    };

    const sortedModules = [...modules].sort((a,b) => a.order_index - b.order_index);

    return (
        <>
            <Helmet>
                <title>Gestion du Contenu - Souveniirs Formation</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="max-w-7xl mx-auto p-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
                            <Button onClick={() => activeTab === 'modules' ? handleOpenModuleModal() : handleOpenLessonModal(null, modules[0]?.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {activeTab === 'modules' ? 'Nouveau Module' : 'Nouvelle Leçon'}
                            </Button>
                        </div>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList>
                                <TabsTrigger value="modules">Modules</TabsTrigger>
                                <TabsTrigger value="lecons">Leçons</TabsTrigger>
                            </TabsList>
                            <TabsContent value="modules">
                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        {sortedModules.map(module => (
                                            <div key={module.id} className="flex items-center p-4 border rounded-lg bg-white shadow-sm">
                                                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                                <div className="ml-4 flex-grow">
                                                    <p className="font-semibold">{module.title} {!module.is_active && <Badge variant="destructive" className="ml-2">Inactif</Badge>}</p>
                                                    <p className="text-sm text-gray-500">{module.description}</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModuleModal(module)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation('module', module.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="lecons">
                                {sortedModules.map(module => (
                                    <div key={module.id} className="mb-6">
                                        <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                                        <Card>
                                            <CardContent className="p-6 space-y-4">
                                                {(module.lessons || []).sort((a,b) => a.order_index - b.order_index).map(lesson => (
                                                    <div key={lesson.id} className="flex items-center p-4 border rounded-lg bg-white shadow-sm">
                                                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                                        <div className="ml-4 flex-grow">
                                                            <p className="font-semibold">{lesson.title} {!lesson.is_active && <Badge variant="destructive" className="ml-2">Inactive</Badge>}</p>
                                                            <p className="text-sm text-gray-500">{lesson.description}</p>
                                                        </div>
                                                        <div className="space-x-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenLessonModal(lesson, module.id)}><Edit className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation('lesson', lesson.id, module.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!module.lessons || module.lessons.length === 0) && <p className="text-sm text-gray-500 text-center py-4">Aucune leçon dans ce module.</p>}
                                                <Button variant="outline" size="sm" onClick={() => handleOpenLessonModal(null, module.id)}><Plus className="h-4 w-4 mr-2"/>Ajouter une leçon à ce module</Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </main>
            </div>

            {/* Module Modal */}
            <Dialog open={isModuleModalOpen} onOpenChange={setModuleModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentModule.id ? "Modifier le Module" : "Créer un Module"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="m-title" className="text-right">Titre</Label>
                            <Input id="m-title" value={currentModule.title} onChange={e => setCurrentModule({...currentModule, title: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="m-desc" className="text-right">Description</Label>
                            <Textarea id="m-desc" value={currentModule.description} onChange={e => setCurrentModule({...currentModule, description: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="m-order" className="text-right">Ordre</Label>
                            <Input id="m-order" type="number" value={currentModule.order_index} onChange={e => setCurrentModule({...currentModule, order_index: parseInt(e.target.value, 10) || 0})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="m-active" className="text-right">Actif</Label>
                            <Switch id="m-active" checked={currentModule.is_active} onCheckedChange={checked => setCurrentModule({...currentModule, is_active: checked})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => setModuleModalOpen(false)} variant="outline">Annuler</Button>
                        <Button type="button" onClick={handleSaveModule}>Sauvegarder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lesson Modal */}
            <Dialog open={isLessonModalOpen} onOpenChange={setLessonModalOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{currentLesson.id ? "Modifier la Leçon" : "Créer une Leçon"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-module" className="text-right">Module</Label>
                            <Select value={currentLesson.module_id?.toString() || ''} onValueChange={value => setCurrentLesson({...currentLesson, module_id: value})} >
                                {modules.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.title}</SelectItem>)}
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-title" className="text-right">Titre</Label>
                            <Input id="l-title" value={currentLesson.title} onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-start gap-x-4">
                            <Label htmlFor="l-desc" className="text-right pt-2">Description</Label>
                            <Textarea id="l-desc" value={currentLesson.description} onChange={e => setCurrentLesson({...currentLesson, description: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-video" className="text-right">URL Vidéo</Label>
                            <Input id="l-video" value={currentLesson.video_url} onChange={e => setCurrentLesson({...currentLesson, video_url: e.target.value})} className="col-span-3" placeholder="https://youtube.com/embed/..."/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-duration" className="text-right">Durée</Label>
                            <Input id="l-duration" value={currentLesson.duration} onChange={e => setCurrentLesson({...currentLesson, duration: e.target.value})} className="col-span-3" placeholder="ex: 15 min"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-order" className="text-right">Ordre</Label>
                            <Input id="l-order" type="number" value={currentLesson.order_index} onChange={e => setCurrentLesson({...currentLesson, order_index: parseInt(e.target.value, 10) || 0})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4">
                            <Label htmlFor="l-active" className="text-right">Active</Label>
                            <Switch id="l-active" checked={currentLesson.is_active} onCheckedChange={checked => setCurrentLesson({...currentLesson, is_active: checked})} />
                        </div>
                         <div className="col-span-4 space-y-2 pt-4">
                            <Label>Texte explicatif / Procédures</Label>
                            <TextEditor 
                                value={currentLesson.explanatory_text} 
                                onChange={val => setCurrentLesson(prev => ({...prev, explanatory_text: val}))}
                            />
                        </div>
                        <div className="col-span-4 space-y-2 pt-4">
                            <Label>Liens de ressources</Label>
                            {(currentLesson.resources_links || []).map((link, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded">
                                    <Input className="col-span-5" placeholder="Titre du lien" value={link.title} onChange={e => handleResourceLinkChange(index, 'title', e.target.value)} />
                                    <Input className="col-span-6" placeholder="URL" value={link.url} onChange={e => handleResourceLinkChange(index, 'url', e.target.value)} />
                                    <Button className="col-span-1" variant="ghost" size="icon" onClick={() => handleRemoveResourceLink(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleAddResourceLink}><Plus className="h-4 w-4 mr-2"/>Ajouter un lien</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setLessonModalOpen(false)}>Annuler</Button>
                        <Button type="button" onClick={handleSaveLesson}>Sauvegarder la Leçon</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><AlertTriangle className="h-6 w-6 text-red-500 mr-2"/>Confirmation de suppression</DialogTitle>
                        <CardDescription>
                           Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
                           {itemToDelete?.type === 'module' && ' Toutes les leçons de ce module seront également supprimées.'}
                        </CardDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
