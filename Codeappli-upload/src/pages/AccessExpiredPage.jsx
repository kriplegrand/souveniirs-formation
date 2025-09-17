import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail } from 'lucide-react';

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
