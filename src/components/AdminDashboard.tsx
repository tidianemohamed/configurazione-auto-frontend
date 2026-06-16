import useAuth from '../hooks/useAuth';
import StoricoPreventivi from './StoricoPreventivi';

interface AdminDashboardProps {
  onEdit: (config: any) => void;
}

function getUserDisplayName(user?: { name?: string; email?: string } | null) {
  if (!user) return 'Amministratore';
  if (user.name?.trim()) return user.name.trim();
  if (!user.email) return 'Amministratore';

  const localPart = user.email.split('@')[0];
  const parts = localPart
    .replace(/[_\.]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

  return parts.length > 0 ? parts.join(' ') : 'Amministratore';
}

export default function AdminDashboard({ onEdit }: AdminDashboardProps) {
  const auth = useAuth();
  const displayName = getUserDisplayName(auth.user);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Dashboard
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Benvenuto, {displayName}
              </h2>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Consulta i tuoi preventivi salvati e ricaricali nel configuratore per modificarli.
              </p>
            </div>
          </div>
        </section>

        <section className="animate-fade-in">
          <StoricoPreventivi onEdit={onEdit} />
        </section>
      </div>
    </main>
  );
}
