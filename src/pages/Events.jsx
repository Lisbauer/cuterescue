import React, { useEffect, useState } from "react";
import AppH1 from "../components/ui/AppH1";
import { getEvents } from "../services/events";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los eventos.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto py-10">
       <LoadingScreen fullScreen={false} className="py-10" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto py-10">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="max-w-6xl w-full mx-auto py-10">
      <AppH1 className="estilosH1 text-center">Eventos mascoteros</AppH1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">
          No hay eventos disponibles actualmente.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
          {events.map((ev) => (
            <article
              key={ev.id}
              className="p-6 rounded-2xl bg-[#22687B] shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-center text-white mb-3">
                {ev.title}
              </h2>

              {ev.summary && (
                <p className="text-sm text-[#d5d5d5] text-center mb-4">
                  {ev.summary}
                </p>
              )}

              {ev.locations?.length > 0 && (
                <div className="text-sm text-white">
                  <strong className="text-[#f7a934] block mb-2">
                    Ubicaciones:
                  </strong>
                  <ul className="list-disc ml-4 space-y-1">
                    {ev.locations.map((loc, i) => (
                      <li key={i}>
                        <span className="font-medium">{loc.name}</span> —{" "}
                        {loc.address}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ev.source_url && (
                <div className="mt-5 flex justify-center">
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#f7a82a] px-5 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90 transition"
                  >
                    Ver más
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}