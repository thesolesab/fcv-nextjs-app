import { useRouter } from 'next/navigation';

export function TeamList({ teams, isLoading, error }: { teams: any[], isLoading: boolean, error: any }) {
  const router = useRouter();

  if (isLoading) return <div className="text-center text-zinc-500 py-8">Загрузка команд...</div>;
  if (error) return <div className="text-center text-red-500 py-8">Ошибка загрузки команд</div>;

  if (teams.length === 0) {
    return (
      <div className="text-center py-10 bg-white/5 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm shadow-xl p-6">
        <div className="text-4xl mb-4">⚽</div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">У вас пока нет команд</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Добавьте этого бота в вашу футбольную группу в Telegram, чтобы автоматически создать команду и управлять играми.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 px-1">Мои Команды</h2>
      {teams.map((team) => (
        <button
          key={team.id}
          onClick={() => router.push(`/team/${team.id}`)}
          className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg group-hover:text-blue-500 transition-colors">
              {team.name}
            </h3>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md mt-2 inline-block">
              {team.role === 'ADMIN' ? 'Администратор' : 'Участник'}
            </span>
          </div>
          <div className="text-zinc-400 group-hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </button>
      ))}
    </div>
  );
}
