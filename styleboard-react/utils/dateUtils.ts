export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  if (seconds < 604800) {
    const d = Math.floor(seconds / 86400);
    return `${d} ${d === 1 ? "day" : "days"} ago`;
  }
  if (seconds < 2592000) {
    const w = Math.floor(seconds / 604800);
    return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  }
  if (seconds < 31536000) {
    const mo = Math.floor(seconds / 2592000);
    return `${mo} ${mo === 1 ? "month" : "months"} ago`;
  }
  const y = Math.floor(seconds / 31536000);
  return `${y} ${y === 1 ? "year" : "years"} ago`;
}