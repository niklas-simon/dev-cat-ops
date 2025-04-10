# Dev🐱Ops

Eine CRUD Webanwendung, welche als Beispiel für die Anwendung von GitHub Actions verwendet werden kann.

## Technologien

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Voraussetzungen

- [Node.js v20](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- Zugang zu einer [MariaDB](https://mariadb.org/)

## Nutzung

### Abhängigkeiten Installieren

```bash
pnpm install
pnpx prisma generate
```

### Umgebung Aufsetzen

Die Datei `.env.example` zeigt eine Beispielkonfiguration der Umgebungsvariablen.
Diese Datei muss in `.env` kopiert und auf die Umgebung angepasst werden.
Folgende Variablen werden unterstützt:
- **DATABASE_URL**: [Pflicht] Gibt die Datenbankverbindung an (Format: `{Treiber}://{Benutzer}:{Passwort}@{Host}:{Port}/{Datenbank}`)
- **CLASSIFI_CAT_ION_URL**: [Pflicht] Gibt die URL zu einem [classifiCATion](https://github.com/maxgeo543/classifiCATion)-Microservice an
- **UPLOAD_FOLDER**: [Optional] Gibt den Pfad an, unter welchem hochgeladene Bilder gespeichert werden sollen

### Datenbank Initialisieren

```bash
pnpx prisma db push -- --skip-generate
```

### Entwicklungsserver Starten

```bash
pnpm run dev
```

### Server Bauen

```bash
pnpm run build
```

### Gebauten Server Starten

```bash
pnpm run start
```

### Test-Runner starten

```bash
pnpm run test
```

## Deployment

### Docker Compose

Dieses Repository enthält eine Beispieldatei für Docker Compose (`docker-compose.yml`). Ist die Datei `.env` richtig konfiguriert, kann diese Beispieldatei verwendet werden, um die Applikation zu bauen (`docker compose build`) und zu starten (`docker compose up -d`).

### Kubernetes

Zusätzlich ist eine Datei `deployment.yaml` vorhanden, welche als Beispiel verwendet werden kann, um die Applikation in einem Kubernetes-Cluster starten zu können.