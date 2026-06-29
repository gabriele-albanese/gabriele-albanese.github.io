# Regole di lavoro — Portfolio Gabriele Albanese

## Regole assolute (nessuna eccezione)

- **Mai usare em dash (—)** in nessun testo: articoli, copy, commit, commenti. Sostituire con virgola, due punti, punto e virgola o parentesi.
- **Mai aggiungere Co-Authored-By** nei commit git. Claude non deve comparire come contributor su GitHub in nessuna forma.
- **Rispondere sempre in italiano**, inclusi messaggi di stato e descrizioni delle azioni.

## All'avvio di ogni sessione

1. Leggi `memory/project_todo_modifiche.md` per sapere cosa manca.
2. Se la memoria non basta o sembra datata, scansiona i file reali del portfolio per capire lo stato attuale:
   - `index.html` — struttura homepage e sezioni
   - `articoli/` — quali articoli esistono
   - `case-study/` — quali case study esistono
   - `intelligence-hub.html` — stato Radar Feed
   - `courses-data.json` — corsi presenti
3. Confronta quello che vedi nei file con quello che dice la memoria. Se c'e discrepanza, fidati dei file.

## Git

- Commit con messaggio descrittivo in italiano, senza Co-Authored-By.
- Pubblicare sempre con: `git add [file] && git commit -m "messaggio" && git push`
- Mai force push su main.

## Struttura portfolio

- Percorso: `C:\Users\gabri\Documents\ClaudeCode\Portfolio`
- Articoli: `articoli/`
- Case study: `case-study/`
- Stile: `assets/css/style.css` — palette teal #0E7490, sfondo #FAFAF8, font Plus Jakarta Sans
- Script: `assets/js/`
- Remote: `https://github.com/gabriele-albanese/gabriele-albanese.github.io`
- Per vedere il sito: `https://gabriele-albanese.github.io`
