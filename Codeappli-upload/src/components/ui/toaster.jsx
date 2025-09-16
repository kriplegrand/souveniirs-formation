import React from 'react';

// Fonction toast temporaire pour remplacer le système de toast manquant
const useToast = () => {
	return {
		toasts: []
	};
};

// Composants toast simplifiés pour le déploiement
const Toast = ({ children, ...props }) => (
	<div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg" {...props}>
		{children}
	</div>
);

const ToastClose = () => (
	<button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
);

const ToastDescription = ({ children }) => (
	<p className="text-sm text-gray-600">{children}</p>
);

const ToastProvider = ({ children }) => <div>{children}</div>;

const ToastTitle = ({ children }) => (
	<h4 className="text-sm font-semibold text-gray-900">{children}</h4>
);

const ToastViewport = () => <div />;

export function Toaster() {
	const { toasts } = useToast();
	
	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, ...props }) => {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
