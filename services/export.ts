import { Share } from 'react-native';
import { getAllTracking, SeriesTracking } from './firestore/tracking';

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
  const divider = '─'.repeat(36);
  const date = new Date().toISOString().split('T')[0];

  const lines: string[] = [
    'BINGE — My Series Export',
    `Exported : ${date}`,
    `Total    : ${series.length} series tracked`,
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
