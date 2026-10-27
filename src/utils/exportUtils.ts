import { Itinerary, ActivityItem } from '../types/trip';

// Generate standard RFC 5545 iCalendar (.ics) format
export function generateICalendar(itinerary: Itinerary): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const startDate = itinerary.preferences.startDate ? new Date(itinerary.preferences.startDate) : new Date();

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VoyageAI//Travel Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICal(itinerary.title)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  itinerary.days.forEach((day, dayIndex) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    day.activities.forEach((act) => {
      // Parse activity time or default based on time slot
      const [hours, minutes] = parseTime(act.time);
      const startDateTime = new Date(dayDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (act.durationMinutes || 90));

      const dtStart = formatICalDate(startDateTime);
      const dtEnd = formatICalDate(endDateTime);
      const uid = `${act.id}-${dayIndex}@voyageai.travel`;

      const description = `${act.description}\n\nCost: ${act.currency} ${act.estimatedCost}\nPro-Tip: ${act.proTip}`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${uid}`);
      icsContent.push(`DTSTAMP:${timestamp}`);
      icsContent.push(`DTSTART:${dtStart}`);
      icsContent.push(`DTEND:${dtEnd}`);
      icsContent.push(`SUMMARY:${escapeICal(act.title)}`);
      icsContent.push(`LOCATION:${escapeICal(act.location)}`);
      icsContent.push(`DESCRIPTION:${escapeICal(description)}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

function parseTime(timeStr: string): [number, number] {
  if (!timeStr) return [10, 0];
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return [10, 0];
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const modifier = match[3]?.toUpperCase();

  if (modifier === 'PM' && h < 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  return [h, m];
}

function formatICalDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function escapeICal(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Download calendar file (.ics)
export function downloadICalendar(itinerary: Itinerary) {
  const icsData = generateICalendar(itinerary);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${itinerary.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Markdown format for sharing in notes or messaging
export function generateMarkdown(itinerary: Itinerary): string {
  let md = `# ${itinerary.title}\n\n`;
  md += `**Destination:** ${itinerary.destination}, ${itinerary.country}\n`;
  md += `**Duration:** ${itinerary.days.length} Days\n`;
  md += `**Style:** ${itinerary.preferences.travelStyle} | **Budget Tier:** ${itinerary.preferences.budgetTier}\n\n`;
  md += `> ${itinerary.summary}\n\n`;

  md += `## ⚡ AI Efficiency Metrics\n`;
  md += `- Planning Time Saved: **${itinerary.efficiencyMetrics.planningHoursSaved} hours**\n`;
  md += `- Route Clustering Score: **${itinerary.efficiencyMetrics.routeClusteringScore}%**\n`;
  md += `- Transit Backtracking Avoided: **${itinerary.efficiencyMetrics.transitTimeSavedMinutes} minutes**\n\n`;

  md += `## 🗓️ Day-by-Day Schedule\n\n`;

  itinerary.days.forEach((day) => {
    md += `### ${day.title} (${day.theme})\n`;
    if (day.weatherForecast) {
      md += `*Forecast:* ${day.weatherForecast.temp} - ${day.weatherForecast.condition} (${day.weatherForecast.advice})\n\n`;
    }

    day.activities.forEach((act) => {
      md += `- **${act.time}** - **${act.title}** (${act.category.toUpperCase()})\n`;
      md += `  - *Location:* ${act.location}\n`;
      md += `  - *Cost:* ${act.currency} ${act.estimatedCost}\n`;
      md += `  - *Description:* ${act.description}\n`;
      md += `  - *💡 Pro-Tip:* ${act.proTip}\n`;
      if (act.transitFromPrevious) {
        md += `  - *Transit:* ${act.transitFromPrevious.mode} (${act.transitFromPrevious.durationMinutes} min) - ${act.transitFromPrevious.instructions}\n`;
      }
      md += `\n`;
    });
    md += `---\n\n`;
  });

  md += `## 💰 Estimated Budget Breakdown (${itinerary.budgetBreakdown.currency})\n`;
  md += `- Lodging: ${itinerary.budgetBreakdown.accommodation}\n`;
  md += `- Dining: ${itinerary.budgetBreakdown.dining}\n`;
  md += `- Activities & Sightseeing: ${itinerary.budgetBreakdown.activities}\n`;
  md += `- Local Transit: ${itinerary.budgetBreakdown.transport}\n`;
  md += `- **Estimated Total:** ${itinerary.budgetBreakdown.currency} ${itinerary.budgetBreakdown.total}\n\n`;

  md += `*Generated with VoyageAI Travel Engine*\n`;
  return md;
}
