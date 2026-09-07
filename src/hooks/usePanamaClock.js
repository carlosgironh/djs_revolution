import { useState, useEffect } from 'react';

export function usePanamaClock() {
  const [time, setTime] = useState('--:--:--');
  const [localDiff, setLocalDiff] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const panama = now.toLocaleTimeString('es-PA', {
        timeZone: 'America/Panama',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setTime(panama);

      const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      setLocalDiff(`🇵🇦 Hora Oficial Cabina: ${panama} (Panamá GMT-5) | 💻 Tu Reloj (${tz}): ${localTime}`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return { time, localDiff };
}
