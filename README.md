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