import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllTracking, SeriesTracking } from './firestore/tracking';

interface ExportSeries {
  seriesId: number;
  name: string;
  status: string;
  totalSeasons: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  seasons: Record<string, number>;
  lastWatchedAt: number;
}

interface ExportData {
  exportedAt: string;
  totalSeries: number;
  series: ExportSeries[];
}

function buildSeasonSummary(watched: Record<string, true>): Record<string, number> {
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

function toExportSeries(t: SeriesTracking): ExportSeries {
  return {
    seriesId: t.seriesId,
    name: t.name,
    status: t.status,
    totalSeasons: t.totalSeasons,
    totalEpisodes: t.totalEpisodes,
    watchedEpisodes: Object.keys(t.watched).length,
    seasons: buildSeasonSummary(t.watched),
    lastWatchedAt: t.lastWatchedAt,
  };
}

export async function exportTrackingData(userId: string): Promise<void> {
  const trackingList = await getAllTracking(userId);

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    totalSeries: trackingList.length,
    series: trackingList
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toExportSeries),
  };

  const json = JSON.stringify(exportData, null, 2);
  const date = new Date().toISOString().split('T')[0];
  const filename = `binge-export-${date}.json`;
  const path = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device');

  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Export Binge Data',
    UTI: 'public.json',
  });
}
