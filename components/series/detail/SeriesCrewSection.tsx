import { View, Text } from 'react-native';
import type { ShowCrewMember } from '@/services/api/types';

interface Props {
  crew: ShowCrewMember[];
}

const ROLE_ORDER = [
  'Creator', 'Showrunner', 'Executive Producer', 'Producer',
  'Director', 'Writer', 'Composer', 'Crew',
];

const SHOWN_ROLES = new Set([
  'Creator', 'Showrunner', 'Executive Producer', 'Producer',
  'Director', 'Writer', 'Composer',
]);

export default function SeriesCrewSection({ crew }: Props) {
  const filtered = crew.filter(m => SHOWN_ROLES.has(m.role));
  if (filtered.length === 0) return null;

  const grouped = filtered.reduce<Record<string, string[]>>((acc, m) => {
    acc[m.role] = [...(acc[m.role] ?? []), m.name];
    return acc;
  }, {});

  const roles = Object.keys(grouped).sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a);
    const bi = ROLE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <View className="mb-7 px-5">
      <Text className="font-heading text-base text-text mb-3">Crew</Text>
      <View className="bg-surface rounded-xl border border-border overflow-hidden">
        {roles.map((role, i) => (
          <View
            key={role}
            className={`flex-row px-4 py-3 ${i < roles.length - 1 ? 'border-b border-border-subtle' : ''}`}
            style={{ gap: 12 }}
          >
            <Text className="font-body-medium text-xs text-text-muted" style={{ width: 130 }}>
              {role}
            </Text>
            <View className="flex-1">
              {grouped[role].map((name, j) => (
                <Text key={j} className="font-body text-xs text-text leading-5">{name}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
