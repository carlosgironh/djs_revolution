// Utilidades oficiales para zona horaria de Panamá (America/Panama, GMT-5)

export function formatPanamaTimestamp(dateStr) {
  if (!dateStr) return { relative: "Reciente", panamaTime: "", displayBadge: "Reciente" };
  const date = new Date(dateStr);
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  const panamaTimeStr = date.toLocaleTimeString('es-PA', {
    timeZone: 'America/Panama',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const panamaDateStr = date.toLocaleDateString('es-PA', {
    timeZone: 'America/Panama',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  let relative = "Hace un momento";
  if (diffSecs >= 60 && diffSecs < 3600) {
    relative = `Hace ${Math.floor(diffSecs / 60)} min`;
  } else if (diffSecs >= 3600 && diffSecs < 86400) {
    relative = `Hace ${Math.floor(diffSecs / 3600)} h`;
  } else if (diffSecs >= 86400 && diffSecs < 604800) {
    relative = `Hace ${Math.floor(diffSecs / 86400)} d`;
  } else if (diffSecs >= 604800) {
    relative = panamaDateStr;
  }

  return {
    relative,
    panamaTime: panamaTimeStr,
    panamaDate: panamaDateStr,
    fullTooltip: `Publicado: ${panamaDateStr}, ${panamaTimeStr} (Hora Oficial de Panamá - GMT-5)`,
    displayBadge: `${relative} • ${panamaTimeStr} (PTY)`
  };
}

export function formatSecondsToTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
