import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getEmailTemplates = (templateName, data) => {
  const templates = {
    welcome_student: {
      subject: `Bienvenue sur Souveniirs Formation, ${data.name} !`,
      body: `
Bonjour ${data.name},

Nous sommes ravis de vous accueillir sur la plateforme de formation Souveniirs !

Voici vos identifiants pour vous connecter :
- Identifiant : ${data.email}
- Code d'accès temporaire : ${data.temp_password}

Lors de votre première connexion, il vous sera demandé de personnaliser votre mot de passe.

Votre accès est valable jusqu'au ${format(new Date(data.expires_at), 'dd MMMM yyyy', { locale: fr })}.

Nous vous souhaitons une excellente formation !

L'équipe Souveniirs
      `,
    },
    welcome_coach: {
      subject: `Bienvenue sur Souveniirs Formation, ${data.name} !`,
      body: `
Bonjour ${data.name},

Nous sommes ravis de vous accueillir sur la plateforme de formation Souveniirs en tant que coach !

Voici vos identifiants pour vous connecter :
- Identifiant : ${data.email}
- Mot de passe : ${data.password}

Vous pouvez vous connecter dès maintenant pour accéder à votre tableau de bord.

L'équipe Souveniirs
      `,
    },
    expiry_soon: {
      subject: `Votre accès à Souveniirs Formation expire bientôt`,
      body: `
Bonjour ${data.name},

Nous vous informons que votre accès à la plateforme Souveniirs Formation expirera le ${format(new Date(data.expires_at), 'dd MMMM yyyy', { locale: fr })}.

Pour continuer à bénéficier de la formation, n'hésitez pas à contacter votre coach pour discuter d'une prolongation.

Cordialement,
L'équipe Souveniirs
      `,
    },
    access_expired: {
      subject: `Votre accès à Souveniirs Formation a expiré`,
      body: `
Bonjour ${data.name},

Votre accès à la plateforme Souveniirs Formation a expiré.

Nous espérons que la formation vous a été bénéfique. Si vous souhaitez prolonger votre accès, veuillez contacter votre coach.

Cordialement,
L'équipe Souveniirs
      `,
    },
  };

  return templates[templateName] || null;
};

export const sendEmail = (options) => {
  const { to, template, data } = options;

  const emailContent = getEmailTemplates(template, data);

  if (!emailContent) {
    console.error(`[Email Simulation] Erreur: Template d'email "${template}" non trouvé.`);
    toast({
      title: "Erreur d'email",
      description: `Le template "${template}" n'existe pas.`,
      variant: 'destructive',
    });
    return;
  }
  
  const emailLog = {
    id: `email_${Date.now()}_${Math.random()}`,
    sent_at: new Date().toISOString(),
    to,
    subject: emailContent.subject,
    body: emailContent.body.trim(),
    status: 'simulated_sent',
  };
  
  console.log('--- EMAIL SIMULATION ---');
  console.log(`À: ${emailLog.to}`);
  console.log(`Sujet: ${emailLog.subject}`);
  console.log('--- Corps de l\'email ---');
  console.log(emailLog.body);
  console.log('------------------------');
  
  try {
    const emailQueue = JSON.parse(localStorage.getItem('souveniirs_email_queue') || '[]');
    emailQueue.unshift(emailLog);
    localStorage.setItem('souveniirs_email_queue', JSON.stringify(emailQueue.slice(0, 50)));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la file d'attente des emails:", error);
  }


  toast({
    title: 'Email (simulé) envoyé !',
    description: `Un email a été envoyé à ${to}.`,
  });
};