import './globals.css';

export const metadata = {
  title: 'Système ERP de Gestion des Tâches',
  description: 'Application professionnelle de gestion des tâches et des utilisateurs',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  )
}