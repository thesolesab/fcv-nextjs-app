'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useTeamData, useTeamMembers } from '@/hooks/useTeamData';

function MembersDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { members, isLoading: membersLoading, updateRole } = useTeamMembers(teamId);

  if (!isReady || teamLoading || membersLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>;
  }

  if (!team || team.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Доступ запрещен</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Участники</h1>
            <p className="text-sm text-zinc-500 mt-1">{team.name}</p>
          </div>
          <button onClick={() => router.push(`/team/${teamId}`)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Назад
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {members.map((m: any) => {
            const isMe = m.user_id === user?.id;
            const name = m.user.first_name || m.user.username || 'Без имени';
            
            return (
              <div key={m.user_id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                <div>
                  <div className="font-medium">{name} {isMe && '(Вы)'}</div>
                  {m.user.username && <div className="text-xs text-zinc-500">@{m.user.username}</div>}
                </div>
                
                {/* Role Selector */}
                <select
                  value={m.role}
                  disabled={isMe} // нельзя изменить роль самому себе здесь
                  onChange={(e) => updateRole(m.user_id, e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-sm border-0 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="MEMBER">Игрок</option>
                  <option value="COACH">Тренер (составы)</option>
                  <option value="ADMIN">Админ</option>
                </select>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <MembersDashboard teamId={unwrappedParams.id} />
    </TelegramProvider>
  );
}
