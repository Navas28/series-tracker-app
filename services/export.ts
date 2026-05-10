import { Share } from 'react-native';
import { getAllTracking, SeriesTracking } from './firestore/tracking';

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

function buildStats(series: SeriesTracking[]): string[] {
  const total = series.length;
  const ongoing = series.filter(t => isOngoing(t.status)).length;
  const ended = series.filter(t => !isOngoing(t.status)).length;
  const completed = series.filter(
    t => t.totalEpisodes > 0 && Object.keys(t.watched).length >= t.totalEpisodes,
  ).length;
  const episodesWatched = series.reduce((sum, t) => sum + Object.keys(t.watched).length, 0);
  const totalMinutes = series.reduce(
    (sum, t) => sum + Object.keys(t.watched).length * (t.averageRuntime ?? 0),
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

function buildSeasonSummary(watched: Record<string, number | true>): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const key of Object.keys(watched)) {
    const match = key.match(/^S(\d+)E\d+$/);
    if (match) {
      const s = match[1];
      summary[s] = (summary[s] ?? 0) + 1;
    }
  }
  return summary;
}

function formatTxt(series: SeriesTracking[]): string {
  const divider = '─'.repeat(39);
  const date = new Date().toISOString().split('T')[0];

  const lines: string[] = [
    'BINGE — My Series Export',
    `Exported : ${date}`,
    '',
    ...buildStats(series),
    '',
  ];

  for (const t of series) {
    const watchedCount = Object.keys(t.watched).length;
    const seasonMap = buildSeasonSummary(t.watched);
    const maxSeason = t.totalSeasons;

    lines.push(divider);
    lines.push(t.name);
    lines.push(`Status  : ${t.status}`);
    lines.push(`Watched : ${watchedCount} / ${t.totalEpisodes} episodes`);

    for (let s = 1; s <= maxSeason; s++) {
      const watched = seasonMap[String(s)] ?? 0;
      lines.push(`  Season ${s}: ${watched} episodes watched`);
    }
  }

  lines.push(divider);
  return lines.join('\n');
}

export async function exportTrackingData(userId: string): Promise<void> {
  const trackingList = await getAllTracking(userId);
  const sorted = trackingList.sort((a, b) => a.name.localeCompare(b.name));

  const txt = formatTxt(sorted);
  const date = new Date().toISOString().split('T')[0];

  await Share.share({
    title: `binge-export-${date}.txt`,
    message: txt,
  });
}
