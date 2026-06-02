import { Share } from 'react-native';
import type { GqlTrackedSeries } from './api/types';

function isOngoing(status: string): boolean {
  return status === 'Returning Series' || status === 'In Production' || status === 'To Be Determined';
}

function formatWatchTime(totalMinutes: number): { full: string; hours: string } {
  const totalHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const mPart = mins > 0 ? ` ${mins}m` : '';
  if (totalHours < 24) return { full: `${totalHours}h${mPart}`, hours: '' };
  const days = Math.floor(totalHours / 24);
  const hrs = totalHours % 24;
  const hPart = hrs > 0 ? ` ${hrs}h` : '';
  return {
    full: `${days}d${hPart}${mPart}`,
    hours: `${totalHours}h${mPart}`,
  };
}

function buildStats(tracking: GqlTrackedSeries[]): string[] {
  const total = tracking.length;
  const ongoing = tracking.filter(t => isOngoing(t.series.status ?? '')).length;
  const ended = tracking.filter(t => !isOngoing(t.series.status ?? '')).length;
  const completed = tracking.filter(
    t => (t.series.totalEpisodes ?? 0) > 0 && t.watchedEpisodes.length >= (t.series.totalEpisodes ?? 0),
  ).length;
  const episodesWatched = tracking.reduce((sum, t) => sum + t.watchedEpisodes.length, 0);
  const totalMinutes = tracking.reduce(
    (sum, t) => sum + t.watchedEpisodes.length * (t.series.averageRuntime ?? 0),
    0,
  );
  const watchTime = formatWatchTime(Math.round(totalMinutes));

  return [
    '┌─ STATS ───────────────────────────────┐',
    `  Total Series   : ${total}`,
    `  Ongoing        : ${ongoing}`,
    `  Ended          : ${ended}`,
    `  Completed      : ${completed}`,
    `  Episodes       : ${episodesWatched} watched`,
    `  Watch Time     : ${watchTime.full}`,
    ...(watchTime.hours ? [`               ( ${watchTime.hours} )`] : []),
    '└───────────────────────────────────────┘',
  ];
}

function buildSeasonSummary(tracking: GqlTrackedSeries): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const ep of tracking.watchedEpisodes) {
    const s = String(ep.season);
    summary[s] = (summary[s] ?? 0) + 1;
  }
  return summary;
}

function formatTxt(tracking: GqlTrackedSeries[]): string {
  const divider = '─'.repeat(39);
  const date = new Date().toISOString().split('T')[0];

  const lines: string[] = [
    'BINGE — My Series Export',
    `Exported : ${date}`,
    '',
    ...buildStats(tracking),
    '',
  ];

  for (const t of tracking) {
    const watchedCount = t.watchedEpisodes.length;
    const seasonMap = buildSeasonSummary(t);
    const maxSeason = t.series.totalSeasons ?? 0;

    lines.push(divider);
    lines.push(t.series.name);
    lines.push(`Status  : ${t.series.status ?? 'Unknown'}`);
    lines.push(`Watched : ${watchedCount} / ${t.series.totalEpisodes ?? 0} episodes`);

    for (let s = 1; s <= maxSeason; s++) {
      const watched = seasonMap[String(s)] ?? 0;
      lines.push(`  Season ${s}: ${watched} episodes watched`);
    }
  }

  lines.push(divider);
  return lines.join('\n');
}

export async function exportTrackingData(tracking: GqlTrackedSeries[]): Promise<void> {
  const sorted = [...tracking].sort((a, b) => a.series.name.localeCompare(b.series.name));
  const txt = formatTxt(sorted);
  const date = new Date().toISOString().split('T')[0];

  await Share.share({
    title: `binge-export-${date}.txt`,
    message: txt,
  });
}
