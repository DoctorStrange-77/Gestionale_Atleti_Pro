# Builder Athlete Manager — Demo Vibe Coding

## Descrizione

**Builder Athlete Manager** è un'applicazione dimostrativa didattica creata per mostrare come progettare e realizzare gestionali web moderni e reattivi utilizzando strumenti di intelligenza artificiale e metodologie di *vibe coding*. 

L'applicazione simula una piattaforma completa per coach, personal trainer, preparatori atletici e centri sportivi, consentendo di esplorare le logiche di gestione dell'anagrafica atleti, piani abbonamento, incassi, comunicazioni e scadenze all'interno di un'interfaccia utente curata e performante.

---

## Avvertenza

> ⚠️ **IMPORTANTE: LEGGERE ATTENTAMENTE PRIMA DELL'USO**
> 
> - **Prodotto dimostrativo**: Questa applicazione è esclusivamente una demo didattica e **non è un prodotto pronto per l'utilizzo professionale o di produzione**.
> - **Nessun database reale**: Non utilizza un vero database backend di default (salvo eventuale configurazione opzionale di Supabase).
> - **Nessuna autenticazione reale**: L'autenticazione è simulata a fini illustrativi quando Supabase non è configurato.
> - **Persistenza in `localStorage`**: Tutti i dati inseriti o modificati vengono salvati unicamente nella memoria locale del tuo browser (`localStorage`).
> - **Nessun dato reale**: **Non devono mai essere inseriti dati personali, sanitari, bancari o economici reali**.
> - **Integrazioni API simulate**: Le funzionalità di invio messaggi (WhatsApp, Telegram, Email, Webhooks) o caricamento file preparano i payload e aprono client esterni o memorizzano i file nel browser; non effettuano chiamate API verso servizi terzi reali.
> - **Gestione documenti locale**: I file caricati vengono convertiti in base64 e salvati nel browser entro un limite massimo di 1 MB per file per prevenire il riempimento della memoria.
> - **Rischio di perdita dati**: Cancellando la cronologia, la cache o i dati di navigazione del browser, le modifiche apportate verranno perse.

---

## Funzioni Dimostrative

L'applicazione include i seguenti moduli funzionali:

- **Atleti**: Gestione dell'anagrafica completa, schede dettaglio, stato iscrizione e storico attività.
- **Pacchetti**: Definizione di servizi, schede di allenamento, ingressi e tipologie di abbonamento.
- **Abbonamenti**: Assegnazione e tracciamento delle iscrizioni e dei contratti attivi.
- **Pagamenti**: Registrazione degli incassi, gestione dei saldi, ricevute e monitoraggio delle scadenze contabili.
- **Rate**: Piani di rateizzazione personalizzati con scadenze temporali.
- **Rinnovi**: Gestione e avvisi per i rinnovi di abbonamento imminenti.
- **Scadenze**: Monitoraggio e avvisi per i certificati medici e le quote associative.
- **Attività**: Lista di task operativi, to-do list e promemoria con priorità e stati.
- **Calendario**: Vista interattiva di eventi, sessioni di allenamento e scadenze.
- **Documenti**: Caricamento simulato, organizzazione per categoria e consultazione dei file atleta.
- **Consensi**: Modulo per la gestione dei consensi alla privacy e norme GDPR.
- **Comunicazioni**: Invio di notifiche e messaggi personalizzati tramite template.
- **Dashboard**: Panoramica generale con grafici, avvisi e indicatori di performance.
- **KPI**: Metriche di ricavo medio per atleta (ARPU), tasso di rinnovo e indicatori aziendali.
- **Report**: Analisi avanzate finanziarie, contabili, fatturato e saldi sospesi.
- **Collaboratori**: Gestione del team interno, dello staff e dei preparatori.
- **Ruoli**: Configurazione delle autorizzazioni e dei livelli di accesso (Admin, Coach, Reception).
- **Impostazioni**: Personalizzazione dell'organizzazione, temi grafici e gestione dati demo.
- **Portale Atleta Dimostrativo**: Vista self-service riservata agli atleti per consultare i propri dati.

---

## Tecnologie

L'architettura frontend è sviluppata con:

- **React 19** — Framework per interfacce utente a componenti.
- **TypeScript** — Tipizzazione statica per una maggiore robustezza del codice.
- **Vite** — Build tool reattivo ed efficiente.
- **Tailwind CSS** — Framework di utility-first styling.
- **Recharts** — Libreria per la visualizzazione dei grafici e dei KPI.
- **Lucide React** — Set di icone vettoriali moderne.
- **localStorage** — Engine di persistenza locale per la modalità demo.

> *Nota: Supabase è indicato esclusivamente come predisposizione futura opzionale e non costituisce una dipendenza obbligatoria per il funzionamento della demo.*

---

## Installazione

Per eseguire il progetto in locale, clonare il repository e installare le dipendenze:

```bash
git clone https://github.com/DoctorStrange-77/Gestionale_Atleti_Pro.git
cd Gestionale_Atleti_Pro
npm install
npm run dev
```

---

## Controlli

Per verificare la qualità del codice ed eseguire la build di produzione:

```bash
# Verifica dei tipi TypeScript
npm run lint

# Build di produzione
npm run build
```

---

## Ripristino Dati

In qualsiasi momento è possibile ripristinare i dati dimostrativi iniziali dell'applicazione:

1. Accedere alla sezione **Impostazioni** dal menu principale.
2. Selezionare la scheda **17. Gestione Dati Dimostrativi e Backup** (oppure fare clic su *Ripristina Dati* dal banner della modalità demo).
3. Cliccare sul pulsante **Ripristina dati demo** e confermare l'operazione.

L'operazione eliminerà unicamente le chiavi salvate nel `localStorage` relative a questo progetto (`builder_athlete_*`), ricaricando lo stato iniziale di esempio senza intaccare altri dati del browser.

---

## Licenza e Utilizzo

Questo progetto è fornito esclusivamente a **scopo educativo e dimostrativo** per illustrare l'integrazione di interfacce gestionali complesse realizzate con tecniche di vibe coding.
