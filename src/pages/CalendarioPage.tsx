import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  UserCheck,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ListFilter,
  MapPin,
  CalendarDays,
  CalendarRange,
  List,
} from 'lucide-react';
import { useCalendarEvents } from '../context/CalendarContext';
import { useAthletes } from '../context/AthletesContext';
import { CalendarEvent, CalendarEventType, CalendarEventStatus } from '../types';
import { NewEventModal, EVENT_TYPE_LABELS } from '../components/calendar/NewEventModal';
import { EventDetailsModal } from '../components/calendar/EventDetailsModal';

type CalendarViewMode = 'giorno' | 'settimana' | 'mese' | 'agenda';
type PeriodFilter = 'oggi' | 'settimana' | 'mese' | '30giorni' | 'tutto';

export const CalendarioPage: React.FC = () => {
  const { allEvents } = useCalendarEvents();
  const { athletes } = useAthletes();

  // State
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mese');
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-29T12:00:00'));
  const [selectedAthlete, setSelectedAthlete] = useState<string>('all');
  const [selectedCoach, setSelectedCoach] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('tutto');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<CalendarEvent | null>(null);

  // Extract unique coaches
  const coachesList = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      if (e.coachName) set.add(e.coachName);
    });
    return Array.from(set);
  }, [allEvents]);

  // Date navigation helpers
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'giorno') newD.setDate(newD.getDate() - 1);
    else if (viewMode === 'settimana') newD.setDate(newD.getDate() - 7);
    else if (viewMode === 'mese') newD.setMonth(newD.getMonth() - 1);
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'giorno') newD.setDate(newD.getDate() + 1);
    else if (viewMode === 'settimana') newD.setDate(newD.getDate() + 7);
    else if (viewMode === 'mese') newD.setMonth(newD.getMonth() + 1);
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-07-29T12:00:00'));
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    const todayStr = '2026-07-29';

    return allEvents.filter((event) => {
      // Atleta
      if (selectedAthlete !== 'all') {
        if (event.athleteId !== selectedAthlete && event.athleteName !== selectedAthlete) {
          return false;
        }
      }

      // Coach
      if (selectedCoach !== 'all') {
        if (event.coachName !== selectedCoach) return false;
      }

      // Tipologia
      if (selectedType !== 'all') {
        if (event.type !== selectedType) return false;
      }

      // Stato
      if (selectedStatus !== 'all') {
        if (event.status !== selectedStatus) return false;
      }

      // Periodo
      if (selectedPeriod === 'oggi') {
        if (event.date !== todayStr) return false;
      } else if (selectedPeriod === 'settimana') {
        // week range around 2026-07-27 to 2026-08-02
        if (event.date < '2026-07-27' || event.date > '2026-08-02') return false;
      } else if (selectedPeriod === 'mese') {
        if (!event.date.startsWith('2026-07')) return false;
      } else if (selectedPeriod === '30giorni') {
        if (event.date < todayStr || event.date > '2026-08-28') return false;
      }

      return true;
    });
  }, [allEvents, selectedAthlete, selectedCoach, selectedType, selectedStatus, selectedPeriod]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedAthlete('all');
    setSelectedCoach('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedPeriod('tutto');
  };

  const isFiltered =
    selectedAthlete !== 'all' ||
    selectedCoach !== 'all' ||
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPeriod !== 'tutto';

  // Formatting header label
  const currentDateLabel = useMemo(() => {
    const year = currentDate.getFullYear();
    const monthNames = [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ];
    const month = monthNames[currentDate.getMonth()];

    if (viewMode === 'giorno') {
      return `${currentDate.getDate()} ${month} ${year}`;
    }
    if (viewMode === 'settimana') {
      return `Settimana di ${month} ${year}`;
    }
    return `${month} ${year}`;
  }, [currentDate, viewMode]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const inProgramma = filteredEvents.filter((e) => e.status === 'in programma').length;
    const completati = filteredEvents.filter((e) => e.status === 'completato').length;
    const scaduti = filteredEvents.filter((e) => e.status === 'scaduto').length;
    return { total, inProgramma, completati, scaduti };
  }, [filteredEvents]);

  // Helper for Month Grid
  const daysInMonthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for 1st day (0 = Sunday, convert to Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday

    const days = [];
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span>Calendario Appuntamenti & Scadenze</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              {filteredEvents.length} Eventi
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pianificazione di lezioni, check-in, abbonamenti, scadenze mediche, pagamenti ed eventi.
          </p>
        </div>

        <button
          id="btn-add-evento-calendario"
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuovo Evento</span>
        </button>
      </div>

      {/* Stats KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Totale Eventi</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.total}</p>
          </div>
          <CalendarDays className="w-6 h-6 text-amber-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">In Programma</p>
            <p className="text-lg font-black text-blue-400 mt-0.5">{stats.inProgramma}</p>
          </div>
          <Clock className="w-6 h-6 text-blue-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Completati</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{stats.completati}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Scaduti / Alert</p>
            <p className="text-lg font-black text-rose-400 mt-0.5">{stats.scaduti}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400/60" />
        </div>
      </div>

      {/* Main Toolbar: View Selector & Date Controls */}
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        {/* View mode buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('giorno')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'giorno'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Giorno</span>
          </button>

          <button
            onClick={() => setViewMode('settimana')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'settimana'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Settimana</span>
          </button>

          <button
            onClick={() => setViewMode('mese')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'mese'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Mese</span>
          </button>

          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'agenda'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>
        </div>

        {/* Navigation Date Header */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={handlePrev}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition-colors"
            title="Precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 rounded-xl text-xs font-bold transition-colors"
          >
            Oggi
          </button>

          <span className="text-sm font-black text-white min-w-[150px] text-center tracking-wide">
            {currentDateLabel}
          </span>

          <button
            onClick={handleNext}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition-colors"
            title="Successivo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtri Avanzati Calendario</span>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera Filtri</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Atleta filter */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-400" /> Atleta
            </label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutti gli Atleti</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Coach filter */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Coach
            </label>
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutti i Coach</option>
              {coachesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tipologia filter */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Tipologia
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutte le Tipologie</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stato filter */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Stato
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="in programma">In programma</option>
              <option value="completato">Completato</option>
              <option value="scaduto">Scaduto</option>
              <option value="in attesa">In attesa</option>
              <option value="annullato">Annullato</option>
            </select>
          </div>

          {/* Periodo filter */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-amber-400" /> Periodo
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="tutto">Tutto il Periodo</option>
              <option value="oggi">Oggi (29 Luglio)</option>
              <option value="settimana">Questa Settimana</option>
              <option value="mese">Questo Mese (Luglio)</option>
              <option value="30giorni">Prossimi 30 Giorni</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW RENDERERS */}

      {/* 1. MESE VIEW */}
      {viewMode === 'mese' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/90 text-center text-[11px] font-bold text-zinc-400 uppercase py-2.5">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Gio</div>
            <div>Ven</div>
            <div>Sab</div>
            <div>Dom</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-800/60 bg-zinc-950">
            {daysInMonthGrid.map((dayObj, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.date === dayObj.dateStr);
              const isToday = dayObj.dateStr === '2026-07-29';

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-1.5 transition-colors ${
                    dayObj.isCurrentMonth ? 'bg-zinc-950/80' : 'bg-zinc-900/20 text-zinc-600'
                  } ${isToday ? 'ring-2 ring-amber-400/80 bg-amber-500/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span
                      className={`text-xs font-black rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30'
                          : dayObj.isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {dayObj.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 max-h-[100px] overflow-y-auto pr-0.5">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const typeMeta = EVENT_TYPE_LABELS[evt.type] || {
                        label: evt.type,
                        badgeClass: 'bg-zinc-800 text-zinc-300',
                      };

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventDetails(evt)}
                          className={`p-1 rounded-md text-[10px] font-bold truncate cursor-pointer hover:brightness-125 transition-all border ${typeMeta.colorClass}`}
                          title={`${evt.title} (${evt.athleteName || 'Generale'})`}
                        >
                          <span className="mr-1">{evt.startTime || '•'}</span>
                          {evt.title}
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <p
                        onClick={() => {
                          setViewMode('agenda');
                        }}
                        className="text-[9px] text-amber-400 font-bold hover:underline cursor-pointer text-center pt-0.5"
                      >
                        +{dayEvents.length - 3} altri
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SETTIMANA VIEW */}
      {viewMode === 'settimana' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[
              { name: 'Lunedì', dateStr: '2026-07-27' },
              { name: 'Martedì', dateStr: '2026-07-28' },
              { name: 'Mercoledì', dateStr: '2026-07-29' },
              { name: 'Giovedì', dateStr: '2026-07-30' },
              { name: 'Venerdì', dateStr: '2026-07-31' },
              { name: 'Sabato', dateStr: '2026-08-01' },
              { name: 'Domenica', dateStr: '2026-08-02' },
            ].map((day, idx) => {
              const dayEvts = filteredEvents.filter((e) => e.date === day.dateStr);
              const isToday = day.dateStr === '2026-07-29';

              return (
                <div
                  key={idx}
                  className={`bg-zinc-900/60 border rounded-xl p-2.5 flex flex-col gap-2 min-h-[220px] ${
                    isToday ? 'border-amber-500/80 ring-1 ring-amber-500/30' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">{day.name}</p>
                      <p className="text-xs font-black text-white">{day.dateStr.split('-')[2]} Lug</p>
                    </div>
                    {isToday && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-zinc-950 font-black text-[9px] rounded-md">
                        Oggi
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    {dayEvts.length === 0 ? (
                      <p className="text-[10px] text-zinc-600 text-center mt-6">Nessun evento</p>
                    ) : (
                      dayEvts.map((evt) => {
                        const typeMeta = EVENT_TYPE_LABELS[evt.type];
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventDetails(evt)}
                            className={`p-2 rounded-lg text-[10px] border cursor-pointer hover:brightness-110 transition-all ${typeMeta?.colorClass}`}
                          >
                            <p className="font-bold text-white truncate">{evt.title}</p>
                            {evt.startTime && (
                              <p className="text-zinc-400 text-[9px] mt-0.5 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-400" />
                                {evt.startTime}
                              </p>
                            )}
                            {evt.athleteName && (
                              <p className="text-amber-300 font-medium text-[9px] truncate mt-0.5">
                                {evt.athleteName}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GIORNO VIEW */}
      {viewMode === 'giorno' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Programma Giornaliero</h3>
              <p className="text-xs text-zinc-400">29 Luglio 2026</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              {filteredEvents.filter((e) => e.date === '2026-07-29').length} Attività Pianificate
            </span>
          </div>

          <div className="space-y-2">
            {filteredEvents.filter((e) => e.date === '2026-07-29').length === 0 ? (
              <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl">
                Nessun evento in programma per questa giornata.
              </div>
            ) : (
              filteredEvents
                .filter((e) => e.date === '2026-07-29')
                .map((evt) => {
                  const typeMeta = EVENT_TYPE_LABELS[evt.type];

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventDetails(evt)}
                      className="p-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:border-amber-500/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-white">{evt.title}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${typeMeta?.badgeClass}`}>
                              {typeMeta?.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                            {evt.startTime && <span>Ora: {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>}
                            {evt.athleteName && <span>Atleta: <strong className="text-zinc-200">{evt.athleteName}</strong></span>}
                            {evt.coachName && <span>Coach: <strong className="text-zinc-200">{evt.coachName}</strong></span>}
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {evt.status}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 4. AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-white">Agenda Cronologica Eventi & Scadenze</h3>
            <span className="text-xs text-zinc-400 font-semibold">{filteredEvents.length} eventi totali</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 bg-zinc-900/50 rounded-xl">
                Nessun evento trovato corrispondente ai filtri selezionati.
              </div>
            ) : (
              filteredEvents
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((evt) => {
                  const typeMeta = EVENT_TYPE_LABELS[evt.type] || {
                    label: evt.type,
                    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                  };

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventDetails(evt)}
                      className="p-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all hover:border-amber-500/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-center min-w-[70px]">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">
                            {evt.date.split('-')[1]} / {evt.date.split('-')[0]}
                          </p>
                          <p className="text-sm font-black text-amber-400">{evt.date.split('-')[2]}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs text-white">{evt.title}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${typeMeta.badgeClass}`}>
                              {typeMeta.label}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3 flex-wrap">
                            {evt.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {evt.startTime}
                              </span>
                            )}
                            {evt.athleteName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-amber-400" />
                                {evt.athleteName}
                              </span>
                            )}
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                {evt.location}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          evt.status === 'completato'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : evt.status === 'scaduto'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <NewEventModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultDate="2026-07-29"
      />

      <EventDetailsModal
        event={selectedEventDetails}
        onClose={() => setSelectedEventDetails(null)}
      />
    </div>
  );
};
