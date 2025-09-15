import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail } from 'lucide-react';

export default function AccessExpiredPage() {
	const { logout } = useAuth();
	const navigate = useNavigate();
    return (
        <>
            <Helmet>
                <title>Accès Expiré - Souveniirs Formation</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-xl text-center">
                        <CardHeader>
                            <div className="flex justify-center">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Clock className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                            <CardTitle>Votre accès a expiré</CardTitle>
                            <CardDescription>
                                Votre abonnement à la formation est terminé. Pour continuer votre parcours, veuillez renouveler votre accès.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Pour toute question ou pour réactiver votre compte, contactez votre coach.
                            </p>
                            <a href="mailto:support@souveniirs.com">
                                <Button variant="outline" className="w-full">
                                    <Mail className="mr-2 h-4 w-4" /> Contacter le support
                                </Button>
                            </a>
                            <Button onClick={() => { logout(); navigate('/login'); }} className="w-full">
                                Retour à la page de connexion
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}