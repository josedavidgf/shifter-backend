import { format, parseISO } from 'date-fns';

export default function DayDetailReceived({ entry }) {
  const parsedDate = parseISO(entry.date);
  const displayDay = format(parsedDate, 'EEEE', { locale: undefined }); // Adjust locale as needed

  return (
    <div>
      <h3 className="font-bold mb-2">
        {`${displayDay}, ${format(parsedDate, 'dd/MM')} - Turno recibido`}
      </h3>
      <p className="mb-4">
        El {displayDay.toLowerCase()}, {format(parsedDate, 'dd/MM')} tienes turno de {entry.shift_type?.toLowerCase()}. Te lo ha cambiado {entry.related_worker?.name} {entry.related_worker?.surname}.
      </p>
      {/* Other content */}
    </div>
  );
}
