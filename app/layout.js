export const metadata = {
  title: 'Gestionnaire de Tâches',
  description: 'Application de gestion de tâches avec Next.js et Spring Boot',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}