const relativeFormatter = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });

export function formatRelativeTime(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) {
    return "";
  }

  const diff = time - Date.now();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, "minute");
  }

  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, "hour");
  }

  const days = Math.round(diff / 86400000);
  return relativeFormatter.format(days, "day");
}

export function formatDate(value: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "zh-CN",
    options ?? {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );
}

export function formatTimeOfDay(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
