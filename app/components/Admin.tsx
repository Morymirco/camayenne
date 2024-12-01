import AdminSkeleton from './AdminSkeleton'

// Dans votre composant Admin
return (
  <div className="container mx-auto px-4 py-8">
    {isLoading ? (
      <AdminSkeleton />
    ) : (
      // Votre contenu existant
    )}
  </div>
) 