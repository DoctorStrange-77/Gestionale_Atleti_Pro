import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useToast } from './ToastContext';
import { STORAGE_KEYS } from '../config/storageKeys';

interface TasksContextType {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const STORAGE_KEY = STORAGE_KEYS.TASKS;

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Verifica scheda di allenamento Hypertrophy',
    description: 'Revisione dei carichi progressivi su Panca Piana e Squat per la settimana 4.',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    responsible: 'Coach Roberto',
    priority: 'alta',
    dueDate: '2026-07-30',
    dueTime: '10:00',
    status: 'in lavorazione',
    category: 'Allenamento',
    reminder: '2026-07-30 09:30 - Notifica al Coach',
    notes: 'Focus sull ampiezza del movimento e tempo di sotto tensione.',
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Consegna piano nutrizionale e macro',
    description: 'Inviare la nuova dieta ipocalorica aggiornata con le percentuali pesate.',
    athleteId: 'ath-2',
    athleteName: 'Laura Bianchi',
    responsible: 'Coach Elena',
    priority: 'urgente',
    dueDate: '2026-07-29',
    dueTime: '15:00',
    status: 'da fare',
    category: 'Nutrizione',
    reminder: '2026-07-29 12:00',
    notes: 'Includere integratori di Omega 3 e Vitamina D3.',
    createdAt: '2026-07-27T14:30:00Z',
    updatedAt: '2026-07-27T14:30:00Z',
  },
  {
    id: 'task-3',
    title: 'Sollecito rinnovo certificato medico agonistico',
    description: 'Il certificato scade tra pochi giorni. Richiedere copia della visita della medicina dello sport.',
    athleteId: 'ath-3',
    athleteName: 'Giuseppe Verdi',
    responsible: 'Segreteria',
    priority: 'normale',
    dueDate: '2026-08-02',
    dueTime: '11:00',
    status: 'in attesa',
    category: 'Amministrazione',
    reminder: '2026-08-01 09:00',
    notes: 'Inviato messaggio su WhatsApp il 25 luglio.',
    createdAt: '2026-07-25T09:00:00Z',
    updatedAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Check-in settimanale foto e plicometria',
    description: 'Valutazione della composizione corporea e pliche tricipite e sottoscapolare.',
    athleteId: 'ath-1',
    athleteName: 'Marco Rossi',
    responsible: 'Coach Roberto',
    priority: 'normale',
    dueDate: '2026-07-28',
    dueTime: '18:00',
    status: 'completata',
    category: 'Check-in',
    notes: 'Riduzione grasso corporeo dell 0.8% confermata.',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-07-28T18:30:00Z',
  },
  {
    id: 'task-5',
    title: 'Preparazione scheda gara Bodybuilding',
    description: 'Definizione routine di posa e picco di carboidrati per la gara regionale.',
    athleteId: 'ath-4',
    athleteName: 'Andrea Conti',
    responsible: 'Coach Roberto',
    priority: 'urgente',
    dueDate: '2026-08-05',
    dueTime: '09:00',
    status: 'da fare',
    category: 'Gare',
    reminder: '2026-08-04 18:00',
    notes: 'Verificare regolamento e tesseramento federazione.',
    createdAt: '2026-07-26T11:00:00Z',
    updatedAt: '2026-07-26T11:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Chiamata conoscitiva nuovo atleta Lead',
    description: 'Valutazione anamnesi, obiettivi e scelta del pacchetto coaching più idoneo.',
    responsible: 'Commerciale / Coach Elena',
    priority: 'bassa',
    dueDate: '2026-08-01',
    dueTime: '16:30',
    status: 'da fare',
    category: 'Commerciale',
    notes: 'Contatto arrivato dal sito web.',
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
  },
];

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Attività creata con successo', 'success');
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
    showToast('Attività aggiornata', 'info');
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Attività eliminata', 'info');
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t))
    );
    showToast(`Stato attività modificato in "${status}"`, 'success');
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
