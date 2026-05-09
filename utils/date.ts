export function formatEpisodeAirDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  
  const airDate = new Date(dateStr);
  const now = new Date();
  
  // Reset hours to compare only days
  const airDateReset = new Date(airDate.getFullYear(), airDate.getMonth(), airDate.getDate());
  const nowReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = airDateReset.getTime() - nowReset.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // Already released
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  
  // Format as date for far future
  return airDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Returns true if the given air date string has already passed (or is today).
 * Returns false if the date is in the future or if dateStr is null/empty (unknown).
 */
export function isReleased(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true;
  const airDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  airDate.setHours(0, 0, 0, 0);
  return airDate <= today;
}
