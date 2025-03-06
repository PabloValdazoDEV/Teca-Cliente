import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getDataCalendario } from "../API";
import "@/assets/calendario.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
  },
};

const Calendario = ({ trabajador }) => {
  const [citas, setCitas] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState({});
  const [dragEnabled, setDragEnabled] = useState(false);

  const formatHora = (fecha) => {
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    return `${horas - 1}:${minutos}`;
  };

  const getName = (fullName) => {
    const name = fullName.split(" ");
    return name[0];
  };

  useEffect(() => {
    const fetchCitas = async () => {
      if (trabajador) {
        try {
          const data = await getDataCalendario(trabajador);
          setCitas(data);
        } catch (error) {
          console.error("Error al cargar citas:", error);
        }
      }
    };
    fetchCitas();
  }, [trabajador]);

  const openModal = (data) => {
    console.log("Datos recibidos en el modal:", data);
    setDataModal(data);
    setIsOpenModal(true);
  };
  const closeModal = () => {
    setIsOpenModal(false);
  };

  const toggleDrag = () => {
    setDragEnabled(!dragEnabled);
  };

  // Función para evitar solapamientos
  const checkOverlap = (eventDropInfo) => {
    const start = eventDropInfo.event.start;
    const end = eventDropInfo.event.end;

    // Verifica si la nueva ubicación se superpone con otras citas
    const hasOverlap = citas.some((event) => {
      if (event.id !== eventDropInfo.event.id) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (start < eventEnd && end > eventStart); // Si hay solapamiento, retorna true
      }
      return false;
    });

    if (hasOverlap) {
      alert("No puedes solapar citas");
      eventDropInfo.revert(); // Vuelve la cita a su lugar original
    } else {
      // Guardar nueva ubicación en la base de datos
      updateCita(eventDropInfo.event.id, {
        start: eventDropInfo.event.start,
        end: eventDropInfo.event.end,
      });
    }
  };

  return (
    <>
     <button 
        className={`px-4 py-2 rounded text-white ${dragEnabled ? 'bg-red-500' : 'bg-blue-500'}`}
        onClick={toggleDrag}
      >
        {dragEnabled ? "Desactivar Edición" : "Activar Edición"}
      </button>
      <FullCalendar
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay,dayGridMonth",
        }}
        dayHeaderFormat={{ weekday: "long", day: "numeric" }}
        slotDuration="00:30:00"
        slotMinTime="10:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          omitZeroMinute: false,
          hour12: false,
        }}
        businessHours={[
          {
            daysOfWeek: [1, 2, 3, 4],
            startTime: "10:00",
            endTime: "14:00",
          },
          {
            daysOfWeek: [1, 2, 3, 4],
            startTime: "16:00",
            endTime: "20:00",
          },
          {
            daysOfWeek: [5],
            startTime: "10:00",
            endTime: "14:00",
          },
        ]}
        editable={dragEnabled} // Solo permite mover eventos si está activado
        droppable={dragEnabled}
        eventOverlap={false} // Evita solapamientos automáticamente
        eventDrop={checkOverlap} // Verifica solapamientos antes de permitir el cambio
        eventResizableFromStart={false} // Evita que las citas se agranden desde el inicio
        eventDurationEditable={false}
        height="auto"
        contentHeight="auto"
        expandRows={true}
        nowIndicator={true}
        hiddenDays={[0, 6]}
        events={citas}
        eventClick={(info) => openModal(info.event.extendedProps)}
        eventClassNames={() => "evento-cita"}
        eventContent={(info) => {
          return (
            <div className="flex items-center justify-center h-full fc-event-main">
              <p className="text-xs w-full text-center">
                {formatHora(info.event._instance.range.start)} /{" "}
                {formatHora(info.event._instance.range.end)} -{" "}
                {getName(info.event.extendedProps.customerName)}
              </p>
            </div>
          );
        }}
      />
      <Modal
        isOpen={isOpenModal}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <h2>Datos de la cita</h2>
        <p>{dataModal.customerName}</p>
        <p>{dataModal.start}</p>
        <button className="cursor-pointer" onClick={closeModal}>
          close
        </button>
      </Modal>
    </>
  );
};

export default Calendario;
