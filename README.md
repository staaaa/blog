# GameReviews Blog

Blog do recenzji gier komputerowych z zaawansowanym edytorem tekstu i panelem administratora.

## Funkcje

- 📝 System recenzji z wieloma skalami ocen (Fabuła, Muzyka, Grafika, Optymalizacja, Gameplay)
- ⭐ Dodatkowe niestandardowe skale ocen dla każdej recenzji
- 🏷️ Kategoryzacja gier: gatunki, serie, studia
- 🔐 Panel administratora z autentykacją JWT
- 📷 Upload zdjęć do recenzji
- 🔒 Tagi spoilerów (ukrywany tekst)
- 🔍 Wyszukiwarka
- 🎨 Zaawansowany edytor tekstu (Quill.js) z formatowaniem

## Wymagania

- Node.js 20+
- PostgreSQL 14+
- npm 8+

## Instalacja

### 1. Baza danych

Utwórz bazę PostgreSQL:
```sql
CREATE DATABASE game_reviews;
```

### 2. Backend

```bash
cd backend

# Konfiguracja (skopiuj i dostosuj .env)
# DATABASE_URL=postgres://user:password@localhost:5432/game_reviews
# JWT_SECRET=your-secret-key
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=twoje-haslo

npm install
npm run dev
```

Backend będzie dostępny na http://localhost:3000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend będzie dostępny na http://localhost:4200

## Użycie

1. Otwórz http://localhost:4200
2. Zaloguj się do panelu admina: http://localhost:4200/admin/login
   - Domyślne dane: admin / admin123
3. Dodaj gatunki, serie i studia
4. Utwórz pierwszą recenzję!

## API Endpoints

- `GET /api/reviews` - lista recenzji
- `GET /api/reviews/:id` - szczegóły recenzji
- `GET /api/genres` - lista gatunków
- `GET /api/series` - lista serii
- `GET /api/studios` - lista studiów
- `GET /api/reviews/search?q=...` - wyszukiwanie
- `POST /api/auth/login` - logowanie admina

## Technologie

- **Frontend**: Angular 21, Quill.js
- **Backend**: Node.js, Express
- **Baza danych**: PostgreSQL + Sequelize ORM
- **Autentykacja**: JWT

---

## 🐳 Deployment z Docker

Najprostszy sposób uruchomienia całej aplikacji:

### 1. Przygotuj plik .env

```bash
cp .env.example .env
# Edytuj .env i ustaw bezpieczne hasła
```

### 2. Uruchom Docker Compose

```bash
docker compose up -d --build
```

Aplikacja będzie dostępna na **http://localhost** (port 80).

### Struktura kontenerów:
- `gamereviews-frontend` - Angular + Nginx (port 80)
- `gamereviews-backend` - Node.js API (wewnętrzny)
- `gamereviews-db` - PostgreSQL (wewnętrzny)

### Przydatne komendy:

```bash
# Logi
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Stop + usuń dane
docker compose down -v
```

### Dla zewnętrznego dostępu (z internetu):

Jeśli chcesz hostować na domenie, dodaj SSL np. przez Certbot:

```bash
# Na serwerze z domeną
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d twoja-domena.pl
```
