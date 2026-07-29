import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  List,
  Calendar as CalendarIcon,
  Columns,
  RotateCcw,
  User,
  UserCheck,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { useAthletes } from '../context/AthletesContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { NewTaskModal, CATEGORIES, PRIORITY_LABELS, STATUS_LABELS } from '../components/tasks/NewTaskModal';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailsModal } from '../components/tasks/TaskDetailsModal';

type TaskViewMode = 'elenco' | 'calendario' | 'kanban';

export const AttivitaPage: React.FC = () => {
  const { tasks, updateTaskStatus } = useTasks();
  const { athletes } = useAthletes();

  const [viewMode, setViewMode] = useState<TaskViewMode>('elenco');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('all');
  const [selectedResponsible, setSelectedResponsible] = useState<string>('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);

  // Extract unique responsibles
  const responsiblesList = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.responsible) set.add(t.responsible);
    });
    return Array.from(set);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesAthlete = task.athleteName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAthlete) return false;
      }

      // Category
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

      // Priority
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

      // Status
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;

      // Athlete
      if (selectedAthlete !== 'all') {
        if (task.athleteId !== selectedAthlete && task.athleteName !== selectedAthlete) return false;
      }

      // Responsible
      if (selectedResponsible !== 'all' && task.responsible !== selectedResponsible) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus, selectedAthlete, selectedResponsible]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedAthlete('all');
    setSelectedResponsible('all');
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all' ||
    selectedAthlete !== 'all' ||
    selectedResponsible !== 'all';

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const daFare = tasks.filter((t) => t.status === 'da fare').length;
    const inLavorazione = tasks.filter((t) => t.status === 'in lavorazione').length;
    const completate = tasks.filter((t) => t.status === 'completata').length;
    const urgenti = tasks.filter((t) => t.priority === 'urgente' && t.status !== 'completata').length;
    return { total, daFare, inLavorazione, completate, urgenti };
  }, [tasks]);

  // Kanban Columns
  const kanbanColumns: { status: TaskStatus; label: string; badgeClass: string }[] = [
    { status: 'da fare', label: 'Da Fare', badgeClass: 'bg-zinc-800 text-zinc-300' },
    { status: 'in lavorazione', label: 'In Lavorazione', badgeClass: 'bg-amber-500/20 text-amber-300' },
    { status: 'in attesa', label: 'In Attesa', badgeClass: 'bg-purple-500/20 text-purple-300' },
    { status: 'completata', label: 'Completate', badgeClass: 'bg-emerald-500/20 text-emerald-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <span>Gestione Attività & Task Coach</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              {filteredTasks.length} Attività
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pianificazione compiti giornalieri, revisione schede, invio diete e scadenze operativi team.
          </p>
        </div>

        <button
          id="btn-add-nuova-attivita"
          onClick={() => {
            setTaskToEdit(null);
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuova Attività</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Totale Task</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.total}</p>
          </div>
          <CheckSquare className="w-6 h-6 text-amber-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Da Fare</p>
            <p className="text-lg font-black text-zinc-300 mt-0.5">{stats.daFare}</p>
          </div>
          <Clock className="w-6 h-6 text-zinc-500" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">In Lavorazione</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">{stats.inLavorazione}</p>
          </div>
          <Clock className="w-6 h-6 text-amber-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Completate</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{stats.completate}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400/60" />
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Urgenti Attive</p>
            <p className="text-lg font-black text-rose-400 mt-0.5">{stats.urgenti}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400/60" />
        </div>
      </div>

      {/* Main Toolbar: View Tabs & Search */}
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per titolo, atleta o descrizione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-end md:self-auto">
          <button
            onClick={() => setViewMode('elenco')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'elenco'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Elenco</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setViewMode('calendario')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'calendario'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendario</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtri Attività</span>
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
          {/* Categoria */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutte le Categorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priorità */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Priorità
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutte le Priorità</option>
              <option value="bassa">Bassa</option>
              <option value="normale">Normale</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Stato */}
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
              <option value="da fare">Da fare</option>
              <option value="in lavorazione">In lavorazione</option>
              <option value="in attesa">In attesa</option>
              <option value="completata">Completata</option>
              <option value="scaduta">Scaduta</option>
              <option value="annullata">Annullata</option>
            </select>
          </div>

          {/* Atleta */}
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

          {/* Responsabile */}
          <div>
            <label className="block text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Responsabile
            </label>
            <select
              value={selectedResponsible}
              onChange={(e) => setSelectedResponsible(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tutti i Responsabili</option>
              {responsiblesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: ELENCO */}
      {viewMode === 'elenco' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">Nessuna attività trovata</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Crea una nuova attività o modifica i filtri di ricerca per visualizzare altri task.
              </p>
            </div>
          ) : (
            filteredTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onSelect={(task) => setSelectedTaskDetails(task)}
                onEdit={(task) => {
                  setTaskToEdit(task);
                  setIsNewModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 min-w-[260px] flex flex-col shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${col.badgeClass}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
                      Nessuna attività
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onSelect={(task) => setSelectedTaskDetails(task)}
                        onEdit={(task) => {
                          setTaskToEdit(task);
                          setIsNewModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: CALENDARIO TASK */}
      {viewMode === 'calendario' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-white">Calendario Scadenze Attività</h3>
            <span className="text-xs text-amber-400 font-semibold">{filteredTasks.length} task programmati</span>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskDetails(t)}
                  className="p-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-amber-500/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-center min-w-[70px]">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">
                        {t.dueDate.split('-')[1]} / {t.dueDate.split('-')[0]}
                      </p>
                      <p className="text-sm font-black text-amber-400">{t.dueDate.split('-')[2]}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{t.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                        {t.athleteName && <span>Atleta: <strong className="text-zinc-200">{t.athleteName}</strong></span>}
                        <span>Responsabile: <strong className="text-zinc-200">{t.responsible}</strong></span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_LABELS[t.status]?.badgeClass}`}>
                    {t.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <TaskDetailsModal
        task={selectedTaskDetails}
        onClose={() => setSelectedTaskDetails(null)}
        onEdit={(t) => {
          setTaskToEdit(t);
          setIsNewModalOpen(true);
        }}
      />
    </div>
  );
};
