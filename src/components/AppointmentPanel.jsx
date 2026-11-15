/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FiAlertTriangle, FiCalendar, FiCheck, FiClock, FiCopy, FiEdit3, FiFileText, FiMail, FiMessageCircle, FiPhone, FiPlus, FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import { deleteDate, getAppConfig, getCustomerEdit, postDataCreate, putDataEdit, searchCustomers } from "@/API";
import { appointmentFitsExtendedHours, appointmentFitsUsualHours } from "@/utils/appointmentSchedule";
import { phoneText } from "@/utils/contact";

const toInputValue = (date) => {
  if (!date) return "";
  const value = new Date(date);
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const toApiDate = (value) => value ? `${value.replace("T", " ")}:00`.slice(0, 19) : "";


const communicationPhone = (customer) =>
  customer?.phones?.find((item) => item.isCommunicationPhone) || customer?.phones?.[0];

const preferredPhone = (customer) => {
  const phone = communicationPhone(customer);
  return phone ? phoneText(phone) : "";
};

const whatsappPhone = (customer) => {
  const phone = communicationPhone(customer);
  if (!phone) return "";

  const structuredNumber = String(phone.phoneNumber || "").replace(/\D/g, "");
  const countryCode = String(phone.countryCode || "+34").replace(/\D/g, "") || "34";
  if (structuredNumber) {
    return structuredNumber.startsWith(countryCode) && structuredNumber.length > 9
      ? structuredNumber
      : `${countryCode}${structuredNumber}`;
  }

  const rawMatch = String(phone.rawValue || "")
    .match(/(?:\+|00)?\d(?:[\s().-]*\d){7,14}/)?.[0];
  if (!rawMatch) return "";
  const rawDigits = rawMatch.replace(/\D/g, "").replace(/^00/, "");
  if (rawDigits.length === 9) return `34${rawDigits}`;
  return rawDigits.length >= 10 && rawDigits.length <= 15 ? rawDigits : "";
};

const uniquePhoneTexts = (customer) =>
  [...new Set((customer?.phones || []).map(phoneText).filter(Boolean))];

const appointmentMessage = (customer, date) => {
  const firstName = String(customer?.fullName || "").trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola, ${firstName}. ` : "Hola. ";
  const dateText = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeText = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${greeting}Tu cita en TECA está confirmada para el ${dateText} a las ${timeText}. Si necesitas cambiarla, ponte en contacto con el centro.`;
};

const OutsideHoursWarning = () => (
  <div className="appointment-outside-warning" role="status">
    <FiAlertTriangle aria-hidden="true" />
    <span>
      <strong>Esta cita está fuera del horario habitual.</strong>
      Solo el profesional ve este aviso en TECA; no se incluye en ninguna comunicación al cliente.
    </span>
  </div>
);

const AppointmentCommunication = ({ appConfig, customer, date }) => {
  const [copied, setCopied] = useState(false);
  const preference = customer?.preferredCommunication;
  const phone = preferredPhone(customer);
  const whatsappNumber = whatsappPhone(customer);
  const phones = uniquePhoneTexts(customer);
  const message = appointmentMessage(customer, date);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : "";
  const enabledChannels = appConfig?.preferredCommunicationChannels || [];
  const automaticEmailEnabled =
    appConfig?.appointmentCommunicationsEnabled &&
    enabledChannels.includes("EMAIL");
  const automaticSmsEnabled =
    appConfig?.appointmentCommunicationsEnabled &&
    appConfig?.twilioEnabled &&
    enabledChannels.includes("SMS");

  if (date.getTime() < Date.now()) {
    return (
      <div className="appointment-communication is-past">
        <div className="appointment-communication-heading">
          <FiClock />
          <strong>Cita anterior a la fecha y hora actuales</strong>
        </div>
        <span>Se conserva en el historial y no se envía ninguna comunicación al paciente.</span>
      </div>
    );
  }

  if (!preference) {
    return (
      <div className="appointment-communication is-muted">
        <div className="appointment-communication-heading">
          <FiMessageCircle />
          <strong>Comunicación sin definir</strong>
        </div>
        <span>El paciente no tiene un medio preferido.</span>
      </div>
    );
  }

  if (preference === "EMAIL") {
    return (
      <div className="appointment-communication">
        <div className="appointment-communication-heading">
          <FiMail />
          <strong>{automaticEmailEnabled ? "Email automático" : "Email preferido"}</strong>
        </div>
        <span>{customer.emailAddress ? `${automaticEmailEnabled ? "Se ha solicitado el envío de un email a" : "Dirección"}: ${customer.emailAddress}` : "El paciente no tiene una dirección de email."}</span>
        {!automaticEmailEnabled && <small>Los envíos automáticos de citas están desactivados.</small>}
      </div>
    );
  }

  if (preference === "WHATSAPP") {
    const copyMessage = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(message);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = message;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2_000);
      } catch {
        setCopied(false);
      }
    };

    return (
      <div className="appointment-communication">
        <div className="appointment-communication-heading">
          <FiMessageCircle />
          <strong>Enviar WhatsApp{phone ? ` a ${phone}` : ""}</strong>
        </div>
        <span className="appointment-message-copy">{message}</span>
        <div className="appointment-communication-actions">
          {whatsappUrl ? (
            <a className="button-primary communication-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <FiMessageCircle /> Abrir WhatsApp
            </a>
          ) : (
            <button type="button" className="button-primary communication-whatsapp-button" disabled>
              <FiMessageCircle /> WhatsApp no disponible
            </button>
          )}
          <button type="button" className="button-secondary communication-copy-button" onClick={copyMessage}>
            {copied ? <FiCheck /> : <FiCopy />} {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        {!whatsappNumber && <small>El paciente no tiene un teléfono válido para abrir WhatsApp.</small>}
      </div>
    );
  }

  if (preference === "PHONE") {
    return (
      <div className="appointment-communication">
        <div className="appointment-communication-heading">
          <FiPhone />
          <strong>Se tiene que llamar a:</strong>
        </div>
        <div className="appointment-communication-list">
          {phones.length ? phones.map((item) => <span key={item}>{item}</span>) : <span>El paciente no tiene teléfonos.</span>}
        </div>
      </div>
    );
  }

  if (preference === "SMS") {
    return (
      <div className="appointment-communication">
        <div className="appointment-communication-heading">
          <FiMessageCircle />
          <strong>{automaticSmsEnabled ? "SMS automático" : "SMS preferido"}</strong>
        </div>
        <span>{phone ? `${automaticSmsEnabled ? "Se ha solicitado el envío de un SMS a" : "Número"}: ${phone}` : "El paciente no tiene un teléfono de comunicación válido."}</span>
        {!automaticSmsEnabled && <small>El envío automático por SMS está desactivado.</small>}
      </div>
    );
  }

  return null;
};

const calculatedSessionPrice = (hourlyRate, durationMinutes) => {
  const rate = Number(hourlyRate);
  const duration = Number(durationMinutes);
  return rate > 0 && duration > 0 ? Math.round((rate * duration) / 60) : "";
};

const emptyForm = (practitionerId, start, customerId = "", defaultHourlyRate = 0) => ({
  customerId,
  citaDate: toInputValue(start || new Date()),
  userId: practitionerId || "",
  time: 60,
  sessionPrice: calculatedSessionPrice(defaultHourlyRate, 60),
  dateObservation: "",
  dateAdvance: false,
  urgent_date: false,
});

const AppointmentPanel = ({ allowOutsideHours = false, businessHours = [], defaultHourlyRate = 0, draftSeed, draftStart, initialCustomerId, mode, onClose, onCreated, onDraftChange, onShowAvailability, practitioner, selected }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(() => emptyForm(practitioner?.id, draftStart, initialCustomerId, defaultHourlyRate));
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [debouncedCustomerQuery, setDebouncedCustomerQuery] = useState("");
  const [chosenCustomer, setChosenCustomer] = useState(null);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(-1);

  const effectiveMode = mode === "detail" && !editing ? "detail" : "form";
  const { data: appConfig } = useQuery({
    queryKey: ["app-config"],
    queryFn: getAppConfig,
    staleTime: 5 * 60_000,
  });
  const { data: initialCustomer } = useQuery({
    queryKey: ["customer-edit", initialCustomerId],
    queryFn: () => getCustomerEdit(initialCustomerId),
    enabled: Boolean(initialCustomerId) && !selected?.id,
  });
  const { data: customerSearchData, isError: customerSearchFailed, isFetching: isSearchingCustomers } = useQuery({
    queryKey: ["customer-search", debouncedCustomerQuery],
    queryFn: () => searchCustomers(debouncedCustomerQuery),
    enabled: effectiveMode === "form" && !selected?.id && debouncedCustomerQuery.length >= 2 && !chosenCustomer,
    staleTime: 30_000,
  });
  const customerResults = useMemo(() => customerSearchData?.customers || [], [customerSearchData]);
  const normalizedCustomerQuery = customerQuery.trim();
  const isCustomerSearchPending =
    normalizedCustomerQuery.length >= 2 && normalizedCustomerQuery !== debouncedCustomerQuery;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedCustomerQuery(customerQuery.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [customerQuery]);

  useEffect(() => {
    setStatus("");
    setEditing(false);
    if (mode === "detail" && selected) {
      setPriceManuallyEdited(true);
      setChosenCustomer(selected.customer || null);
      setCustomerQuery(selected.customer?.fullName || "");
      setForm({
        customerId: selected.customerId,
        citaDate: toInputValue(selected.start || selected.citaDate),
        userId: selected.practitionerId || "",
        time: selected.time || 60,
        sessionPrice: selected.sessionPrice ?? "",
        dateObservation: selected.dateObservation || "",
        dateAdvance: selected.advance_date === "TRUE",
        urgent_date: Boolean(selected.urgent_date),
      });
    } else if (mode === "create" && draftSeed) {
      setPriceManuallyEdited(false);
      setChosenCustomer(null);
      setCustomerQuery("");
      setForm(emptyForm(draftSeed.practitionerId, draftSeed.start, draftSeed.customerId, draftSeed.defaultHourlyRate));
    }
    setShowCustomerResults(false);
    setActiveCustomerIndex(-1);
  }, [draftSeed, mode, selected]);

  useEffect(() => {
    if (mode !== "create" || priceManuallyEdited) return;
    setForm((current) => {
      const nextPrice = calculatedSessionPrice(defaultHourlyRate, current.time);
      return current.sessionPrice === nextPrice ? current : { ...current, sessionPrice: nextPrice };
    });
  }, [defaultHourlyRate, mode, priceManuallyEdited]);

  useEffect(() => {
    if (mode !== "create" || !draftStart) return;
    const nextDate = toInputValue(draftStart);
    setForm((current) => current.citaDate === nextDate ? current : { ...current, citaDate: nextDate });
  }, [draftStart, mode]);

  useEffect(() => {
    if (mode !== "create" || !practitioner?.id) return;
    setForm((current) => current.userId === practitioner.id ? current : { ...current, userId: practitioner.id });
  }, [mode, practitioner?.id]);

  useEffect(() => {
    if (initialCustomer && form.customerId === initialCustomer.id && !chosenCustomer) {
      setChosenCustomer(initialCustomer);
      setCustomerQuery(initialCustomer.fullName || "");
    }
  }, [chosenCustomer, form.customerId, initialCustomer]);

  useEffect(() => {
    setActiveCustomerIndex(customerResults.length ? 0 : -1);
  }, [customerResults]);

  const currentCustomer = useMemo(
    () => selected?.customer || chosenCustomer || (initialCustomer?.id === form.customerId ? initialCustomer : null),
    [chosenCustomer, form.customerId, initialCustomer, selected]
  );
  const formDate = new Date(form.citaDate);
  const isPastAppointment =
    form.citaDate &&
    !Number.isNaN(formDate.getTime()) &&
    formDate.getTime() < Date.now();
  const isOutsideUsualHours =
    allowOutsideHours &&
    form.citaDate &&
    !Number.isNaN(formDate.getTime()) &&
    appointmentFitsExtendedHours(formDate, Number(form.time) || 60, businessHours) &&
    !appointmentFitsUsualHours(formDate, Number(form.time) || 60, businessHours);
  const isBeyondOutsideHoursMargin =
    allowOutsideHours &&
    form.citaDate &&
    !Number.isNaN(formDate.getTime()) &&
    !appointmentFitsExtendedHours(formDate, Number(form.time) || 60, businessHours);

  useEffect(() => {
    if (mode !== "create" || !form.citaDate) {
      onDraftChange?.(null);
      return;
    }
    const start = new Date(form.citaDate);
    if (Number.isNaN(start.getTime())) {
      onDraftChange?.(null);
      return;
    }
    onDraftChange?.({
      durationMinutes: Number(form.time) || 60,
      start,
      title: currentCustomer?.fullName || "Nueva cita",
    });
  }, [currentCustomer?.fullName, form.citaDate, form.time, mode, onDraftChange]);

  const chooseCustomer = (customer) => {
    setChosenCustomer(customer);
    setCustomerQuery(customer.fullName || `ID-${String(customer.customerNumber).padStart(6, "0")}`);
    setForm((current) => ({ ...current, customerId: customer.id }));
    setShowCustomerResults(false);
    setActiveCustomerIndex(-1);
    setStatus("");
  };

  const changeCustomerQuery = (event) => {
    setCustomerQuery(event.target.value);
    setChosenCustomer(null);
    setForm((current) => ({ ...current, customerId: "" }));
    setShowCustomerResults(true);
    setStatus("");
  };

  const customerKeyDown = (event) => {
    if (!showCustomerResults || !customerResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveCustomerIndex((index) => Math.min(customerResults.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveCustomerIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" && activeCustomerIndex >= 0) {
      event.preventDefault();
      chooseCustomer(customerResults[activeCustomerIndex]);
    } else if (event.key === "Escape") {
      setShowCustomerResults(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        citaDate: toApiDate(form.citaDate),
        time: Number(form.time),
        sessionPrice: form.sessionPrice === "" ? 0 : Number(form.sessionPrice),
        customer: currentCustomer,
      };
      return selected?.id
        ? putDataEdit({ ...payload, dateId: selected.id })
        : postDataCreate(payload);
    },
    onSuccess: async () => {
      const customerId = form.customerId || selected?.customerId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        customerId
          ? queryClient.invalidateQueries({ queryKey: ["customer", customerId] })
          : Promise.resolve(),
      ]);
      const message = selected?.id ? "Cita actualizada" : "Cita creada correctamente";
      setStatus(message);
      onCreated?.(message);
    },
    onError: (error) => setStatus(error.response?.data?.message || "No se ha podido guardar la cita"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDate(selected.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        selected?.customerId
          ? queryClient.invalidateQueries({ queryKey: ["customer", selected.customerId] })
          : Promise.resolve(),
      ]);
      onClose();
    },
    onError: (error) => setStatus(error.response?.data?.message || "No se ha podido eliminar la cita. Sigue en la agenda."),
  });

  const change = (event) => {
    const { checked, name, type, value } = event.target;
    if (name === "sessionPrice") {
      setPriceManuallyEdited(true);
    }
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "time" && !priceManuallyEdited
        ? { sessionPrice: calculatedSessionPrice(defaultHourlyRate, value) }
        : {}),
    }));
  };

  const openAppointmentCustomer = () => {
    const appointment = {
      ...selected,
      start: selected.start ? new Date(selected.start).toISOString() : null,
      end: selected.end ? new Date(selected.end).toISOString() : null,
    };
    navigate(`/customers/${selected.customerId}`, {
      state: {
        appointmentReturn: {
          appointment,
          practitionerId: practitioner?.id || selected.practitionerId || "",
        },
      },
    });
  };

  if (mode === "empty") {
    return (
      <aside className="card appointment-panel is-empty">
        <div className="appointment-panel-inner empty-state">
          <div>
            <FiCalendar size={30} style={{ margin: "0 auto 12px", color: "var(--primary)" }} />
            <strong>Selecciona una cita</strong>
            <p className="helper">Pulsa una hora libre para crearla o una cita para consultar sus datos.</p>
          </div>
        </div>
      </aside>
    );
  }

  if (effectiveMode === "detail") {
    const date = new Date(selected.start || selected.citaDate);
    return (
      <aside className="card appointment-panel is-active is-detail">
        <div className="appointment-panel-inner">
          <div className="panel-heading">
            <div><p className="page-kicker">Detalle de cita</p><h2>{currentCustomer?.fullName || "Paciente"}</h2></div>
            <button type="button" className="button-ghost" onClick={onClose}>Cerrar</button>
          </div>
          <div className="panel-section" style={{ display: "grid", gap: 12 }}>
            <div><FiCalendar /> <strong>{date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</strong></div>
            <div><FiClock /> {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {selected.time} min</div>
            <div><FiUser /> {practitioner?.name} {practitioner?.lastName}</div>
            {allowOutsideHours && !appointmentFitsUsualHours(date, Number(selected.time) || 60, businessHours) && <OutsideHoursWarning />}
          </div>
          <div className="panel-section">
            <p className="helper">Observaciones</p>
            <p>{selected.dateObservation || "Sin observaciones"}</p>
          </div>
          <div className="panel-section">
            <p className="helper">Comunicación con el paciente</p>
            <AppointmentCommunication appConfig={appConfig} customer={currentCustomer} date={date} />
          </div>
          <div className="panel-actions">
            <button type="button" className="button-primary" onClick={() => setEditing(true)}><FiEdit3 /> Editar cita</button>
            <button type="button" className="button-secondary" onClick={openAppointmentCustomer}><FiFileText /> Abrir paciente y documentos</button>
            <button type="button" className="button-danger" disabled={deleteMutation.isPending} onClick={() => window.confirm("¿Eliminar esta cita?") && deleteMutation.mutate()}><FiTrash2 /> Eliminar cita</button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="card appointment-panel is-active is-form">
      <form className="appointment-panel-inner" onSubmit={(event) => { event.preventDefault(); if (!form.customerId) { setStatus("Busca y selecciona un paciente"); return; } setStatus(""); saveMutation.mutate(); }}>
        <div className="panel-heading">
          <div><p className="page-kicker">{selected?.id ? "Editar" : "Nueva cita"}</p><h2>{selected?.id ? currentCustomer?.fullName : "Crear cita"}</h2></div>
          <button type="button" className="button-ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div className="panel-section" style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <label htmlFor="appointment-customer-search">Paciente *</label>
            <div
              className="customer-combobox"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowCustomerResults(false);
              }}
            >
              <FiSearch className="customer-combobox-icon" aria-hidden="true" />
              <input
                id="appointment-customer-search"
                type="search"
                role="combobox"
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="appointment-customer-results"
                aria-expanded={showCustomerResults}
                aria-activedescendant={activeCustomerIndex >= 0 ? `appointment-customer-${activeCustomerIndex}` : undefined}
                aria-invalid={!form.customerId && Boolean(status)}
                value={customerQuery}
                onChange={changeCustomerQuery}
                onFocus={() => !selected?.id && setShowCustomerResults(true)}
                onKeyDown={customerKeyDown}
                placeholder="Buscar por nombre o teléfono…"
                disabled={Boolean(selected?.id)}
              />
              {showCustomerResults && !selected?.id && (
                <div id="appointment-customer-results" className="customer-search-results" role="listbox">
                  {normalizedCustomerQuery.length < 2 ? (
                    <p className="customer-search-info">Escribe al menos 2 caracteres.</p>
                  ) : isCustomerSearchPending || isSearchingCustomers ? (
                    <p className="customer-search-info">Buscando pacientes…</p>
                  ) : customerSearchFailed ? (
                    <p className="customer-search-info is-error">No se ha podido completar la búsqueda.</p>
                  ) : customerResults.length ? customerResults.map((customer, index) => {
                    const phone = preferredPhone(customer);
                    return (
                      <button
                        id={`appointment-customer-${index}`}
                        key={customer.id}
                        type="button"
                        role="option"
                        aria-selected={index === activeCustomerIndex}
                        className={`customer-search-option ${index === activeCustomerIndex ? "is-active" : ""}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveCustomerIndex(index)}
                        onClick={() => chooseCustomer(customer)}
                      >
                        <strong>{customer.fullName || "Sin nombre"}</strong>
                        <span>{phone || "Sin teléfono"} · ID-{String(customer.customerNumber).padStart(6, "0")}</span>
                      </button>
                    );
                  }) : (
                    <p className="customer-search-info">No hay pacientes que coincidan.</p>
                  )}
                </div>
              )}
            </div>
            {currentCustomer && <span className="customer-selected-summary">Seleccionado: {currentCustomer.fullName}{preferredPhone(currentCustomer) ? ` · ${preferredPhone(currentCustomer)}` : ""}</span>}
          </div>
          {!selected?.id && <button type="button" className="availability-button" onClick={onShowAvailability}><FiCalendar /><span><strong>Disponibilidad general</strong><small>Elegir un hueco libre en el calendario</small></span></button>}
          <label className="field"><span>Fecha y hora *</span><input type="datetime-local" name="citaDate" value={form.citaDate} onChange={change} required /></label>
          {isOutsideUsualHours && <OutsideHoursWarning />}
          {isBeyondOutsideHoursMargin && (
            <p className="status-message is-error" role="alert">
              Esta hora queda fuera del margen permitido. Solo puedes reservar desde una hora antes de la apertura hasta una hora después del cierre, en días laborables.
            </p>
          )}
          {isPastAppointment && (
            <div className="appointment-past-warning" role="status">
              <FiClock aria-hidden="true" />
              <span>
                <strong>Esta cita es anterior a la fecha y hora actuales.</strong>
                Se guardará en el historial, pero no se enviará ningún email, SMS ni otra comunicación al cliente.
              </span>
            </div>
          )}
          <div className="appointment-form-grid">
            <label className="field"><span>Duración</span><select name="time" value={form.time} onChange={change}>{[15,30,45,60,75,90,120].map((value) => <option key={value} value={value}>{value} min</option>)}</select></label>
            <label className="field"><span>Precio (€)</span><input name="sessionPrice" type="number" min="0" value={form.sessionPrice} onChange={change} />{Number(defaultHourlyRate) > 0 && !priceManuallyEdited && <small className="helper">{defaultHourlyRate} €/h · cálculo automático</small>}</label>
          </div>
          <label className="field"><span>Observaciones</span><textarea name="dateObservation" value={form.dateObservation} onChange={change} placeholder="Motivo o notas para la sesión" /></label>
          <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}><input type="checkbox" name="dateAdvance" checked={form.dateAdvance} onChange={change} /> Se puede adelantar</label>
          <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}><input type="checkbox" name="urgent_date" checked={form.urgent_date} onChange={change} /> Marcar como urgente</label>
        </div>
        {status && <p className={`status-message ${saveMutation.isError ? "is-error" : ""}`} role="status">{status}</p>}
        <div className="panel-actions">
          <button className="button-primary" disabled={saveMutation.isPending || isBeyondOutsideHoursMargin}><FiPlus /> {saveMutation.isPending ? "Guardando…" : selected?.id ? "Guardar cambios" : "Crear cita"}</button>
          {selected?.id && <button type="button" className="button-secondary" onClick={() => setEditing(false)}>Cancelar edición</button>}
        </div>
      </form>
    </aside>
  );
};

export default AppointmentPanel;
