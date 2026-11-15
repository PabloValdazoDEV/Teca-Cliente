/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FiPrinter } from "react-icons/fi";

const todayValue = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Elige qué imprimir y abre la versión A4 en otra pestaña.
const PrintAgendaMenu = ({ practitioners, selectedId }) => {
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState("day-all");
  const [date, setDate] = useState(todayValue);
  const [practitionerId, setPractitionerId] = useState(selectedId || "");
  const panelRef = useRef(null);

  useEffect(() => { if (selectedId) setPractitionerId(selectedId); }, [selectedId]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!panelRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const needsPractitioner = option !== "day-all";
  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({
      view: option === "week" ? "week" : "day",
      date,
      p: needsPractitioner ? practitionerId : "all",
    });
    window.open(`/print?${params.toString()}`, "_blank", "noopener");
    setOpen(false);
  };

  return (
    <div className="print-menu" ref={panelRef}>
      <button type="button" className="button-secondary" aria-expanded={open} onClick={() => setOpen((value) => !value)}><FiPrinter /> Imprimir</button>
      {open && (
        <form className="print-menu-panel card card-pad" onSubmit={submit}>
          <strong>Imprimir agenda (A4)</strong>
          <label className="team-check"><input type="radio" name="print-option" checked={option === "day-all"} onChange={() => setOption("day-all")} /><span>Día · todos los profesionales</span></label>
          <label className="team-check"><input type="radio" name="print-option" checked={option === "day-one"} onChange={() => setOption("day-one")} /><span>Día · un profesional</span></label>
          <label className="team-check"><input type="radio" name="print-option" checked={option === "week"} onChange={() => setOption("week")} /><span>Semana · un profesional</span></label>
          <label className="field"><span>{option === "week" ? "Cualquier día de la semana" : "Día"}</span><input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label>
          {needsPractitioner && (
            <label className="field"><span>Profesional</span>
              <select required value={practitionerId} onChange={(event) => setPractitionerId(event.target.value)}>
                {practitioners.map((item) => <option key={item.id} value={item.id}>{item.name} {item.lastName || ""}</option>)}
              </select>
            </label>
          )}
          <button className="button-primary"><FiPrinter /> Abrir para imprimir</button>
        </form>
      )}
    </div>
  );
};

export default PrintAgendaMenu;
