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
