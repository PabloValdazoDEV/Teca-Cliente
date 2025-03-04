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

  return (
    <>
      <FullCalendar
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
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
        height="auto"
        contentHeight="auto"
        expandRows={true}
        nowIndicator={true}
        hiddenDays={[0, 6]}
        events={citas}
        editable={true}
        eventClick={(info) => openModal(info.event.extendedProps)}
        eventClassNames={() => "evento-cita"}
      />
      <Modal
        isOpen={isOpenModal}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <h2>Datos de la cita</h2>
        <p>{dataModal.customerName}</p>
        <button className="cursor-pointer" onClick={closeModal}>
          close
        </button>
      </Modal>
    </>
  );
};

export default Calendario;
