import React from 'react';
import { User, Dumbbell, Calendar, CreditCard, Award, FileText, CheckCircle2, Clock, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAthletes } from '../context/AthletesContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { usePayments } from '../context/PaymentsContext';
import { useDocuments } from '../context/DocumentsContext';
import { useCalendar } from '../context/CalendarContext';

export const AtletaPortalePage: React.FC = () => {
  const { user } = useAuth();
  const { athletes } = useAthletes();
  const { subscriptions } = useSubscriptions();
  const { payments } = usePayments();
  const { documents } = useDocuments();
  const { customEvents } = useCalendar();

  // Try matching athlete from logged-in user or pick the first demo athlete
  const currentAthlete = athletes.find(a => a.email.toLowerCase() === user?.email.toLowerCase()) || athletes[0];

  const athleteSubs = currentAthlete ? subscriptions.filter(s => s.athleteId === currentAthlete.id) : [];
  const activeSub = athleteSubs.find(s => s.status === 'attivo') || athleteSubs[0];

  const athletePayments = currentAthlete ? payments.filter(p => p.athleteId === currentAthlete.id) : [];
  const pendingPayment = athletePayments.find(p => p.status === 'da_saldare' || p.status === 'parziale');

  const athleteDocs = currentAthlete ? documents.filter(d => d.athleteId === currentAthlete.id) : [];
  const medicalDoc = athleteDocs.find(d => d.category === 'certificato medico');

  const athleteEvents = currentAthlete
    ? customEvents.filter(e => e.athleteId === currentAthlete.id || e.athleteIds?.includes(currentAthlete.id))
    : customEvents;
  const nextEvent = athleteEvents[0];

  return (
    <div className="space-y-6">
      {/* Required Prominent Top Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
              ANTEPRIMA PORTALE ATLETA — CONTENUTI DIMOSTRATIVI
            </h2>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              Questa vista mostra come un atleta visualizzerebbe i propri dati personali, abbonamenti e schede all'interno dell'app.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 shrink-0 hidden sm:inline-block">
          Dato dimostrativo
        </span>
      </div>

      {/* Hero Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-amber-500/20">
            {(currentAthlete ? `${currentAthlete.firstName} ${currentAthlete.lastName}` : user?.fullName || 'Atleta').charAt(0)}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
              Portale Atleta (Anteprima)
            </span>
            <h1 className="text-xl font-bold text-white mt-1">
              Ciao, {currentAthlete ? `${currentAthlete.firstName} ${currentAthlete.lastName}` : user?.fullName || 'Atleta'}!
            </h1>
            <p className="text-xs text-zinc-300">
              Benvenuto nell'area personale dell'organizzazione <span className="font-semibold text-amber-400">{user?.organizationName}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800 text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-300">
            Stato Abbonamento:{' '}
            <strong className={activeSub ? 'text-emerald-400' : 'text-amber-400'}>
              {activeSub ? activeSub.packageName.toUpperCase() : 'NESSUN ABBONAMENTO ATTIVO'}
            </strong>
          </span>
        </div>
      </div>

      {/* Stats Cards Grid - Dynamic where available */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workout Progress Card (Static Example) */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 relative">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Allenamenti Completi</span>
            <span className="text-[9px] bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">Dato dimostrativo</span>
          </div>
          <p className="text-2xl font-black text-white">24 / 30</p>
          <p className="text-[10px] text-emerald-400 font-semibold">+4 questa settimana</p>
        </div>

        {/* Prossimo Appuntamento (Dynamic from CalendarContext if available) */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Prossimo Appuntamento</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-bold text-white">
            {nextEvent ? `${nextEvent.title} (${nextEvent.date})` : 'Domani • 15:30'}
          </p>
          <p className="text-[10px] text-zinc-400">
            {nextEvent ? nextEvent.time || 'Sessione programmata' : 'Personal Training con Coach'}
          </p>
        </div>

        {/* Prossima Rata (Dynamic from PaymentsContext if available) */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Prossima Rata / Saldo</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">
            € {pendingPayment ? pendingPayment.amount.toFixed(2) : (activeSub ? activeSub.price.toFixed(2) : '150,00')}
          </p>
          <p className="text-[10px] text-amber-400">
            Scadenza: {pendingPayment ? pendingPayment.dueDate : (activeSub ? activeSub.endDate : '15/08/2026')}
          </p>
        </div>

        {/* Certificato Medico (Dynamic from Athlete / Documents if available) */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Certificato Medico</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm font-bold text-emerald-400">
            {currentAthlete ? (currentAthlete.medicalCertificateStatus === 'valido' ? 'Valido' : 'In Scadenza / Mancante') : 'Valido'}
          </p>
          <p className="text-[10px] text-zinc-400">
            Scade il: {currentAthlete?.medicalCertificateExpiry || '30/11/2026'}
          </p>
        </div>
      </div>

      {/* Workout Program & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Sheet Section (Demonstrative) */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              La Tua Scheda di Allenamento Attiva
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
              Dato dimostrativo
            </span>
          </div>

          <div className="space-y-3">
            {[
              { day: 'Lunedì', title: 'Upper Body Power', status: 'Completato', time: '1h 15m' },
              { day: 'Mercoledì', title: 'Lower Body Strength', status: 'In Programma', time: '1h 10m' },
              { day: 'Venerdì', title: 'Full Body Conditioning', status: 'In Programma', time: '1h 00m' },
            ].map((workout, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between hover:border-amber-500/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{workout.day}</span>
                  <h4 className="text-xs font-bold text-white">{workout.title}</h4>
                  <span className="text-[10px] text-zinc-400">{workout.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      workout.status === 'Completato'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {workout.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents & Receipts Section (Dynamic from Documents / Payments where available) */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Documenti & Ricevute Personali
            </h3>
            <span className="text-[10px] text-zinc-400">
              {athleteDocs.length > 0 ? `${athleteDocs.length} documenti trovati` : 'Dato dimostrativo'}
            </span>
          </div>

          <div className="space-y-3">
            {athleteDocs.length > 0 ? (
              athleteDocs.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                    <span className="text-[10px] text-zinc-400">Categoria: {doc.category}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Caricato</span>
                </div>
              ))
            ) : (
              [
                { title: 'Ricevuta Pagamento #4029', date: '01/07/2026', amount: '€ 150,00' },
                { title: 'Modulo Iscrizione & Privacy PDF', date: '15/01/2026', amount: 'Firmato' },
                { title: 'Certificato Medico Agonistico', date: '01/12/2025', amount: 'Approvato' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                    <span className="text-[10px] text-zinc-400">Data: {doc.date}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{doc.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
