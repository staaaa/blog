# 🎮 Giercujemy - Blog o Grach

Blog z recenzjami gier na domenie **giercujemy-staa.duckdns.org**

## 📋 Architektura

| Usługa | Port wewnętrzny | Port na hoście |
|--------|-----------------|----------------|
| PostgreSQL | 5432 | **8200** |
| Backend API | 3000 | — (wewnętrzny) |
| Frontend (Nginx) | 80 | **9000** |
| Reverse Proxy (Nginx systemowy) | — | **80 / 443** |

## 🚀 Deployment na Homelab

### 1. Sklonuj repo na serwer

```bash
git clone <url-repo> ~/gamereviews
cd ~/gamereviews
```

### 2. Skonfiguruj zmienne środowiskowe

```bash
cp .env.example .env
nano .env
```

Ustaw **silne hasła** — wygeneruj JWT secret:
```bash
openssl rand -hex 32
```

### 3. Uruchom kontenery

```bash
docker compose up -d --build
```

Sprawdź czy wszystko działa:
```bash
docker compose ps
docker compose logs -f
```

### 4. Skonfiguruj zewnętrzny Nginx (reverse proxy)

```bash
# Skopiuj config
sudo cp nginx-external.conf /etc/nginx/sites-available/gamereviews

# Włącz
sudo ln -s /etc/nginx/sites-available/gamereviews /etc/nginx/sites-enabled/

# Testuj i załaduj
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Certyfikat SSL (Let's Encrypt)

```bash
# Zainstaluj certbot (jeśli nie masz)
sudo apt install certbot python3-certbot-nginx

# Uzyskaj certyfikat
sudo certbot --nginx -d giercujemy-staa.duckdns.org
```

Certbot automatycznie:
- Pobierze certyfikat
- Zmodyfikuje konfigurację Nginx
- Skonfiguruje auto-odnowienie

### 6. Sprawdź DuckDNS

Upewnij się, że `giercujemy-staa.duckdns.org` wskazuje na Twój publiczny IP. Możesz to zrobić na stronie [DuckDNS](https://www.duckdns.org/) lub skryptem cron:

```bash
# Dodaj do crontab (crontab -e):
*/5 * * * * echo url="https://www.duckdns.org/update?domains=giercujemy-staa&token=TWOJ-TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

## 🔧 Przydatne komendy

```bash
# Restart kontenerów
docker compose restart

# Logi
docker compose logs -f frontend
docker compose logs -f backend

# Podłączenie do bazy (z hosta)
psql -h localhost -p 8200 -U postgres -d game_reviews

# Rebuild po zmianach
docker compose up -d --build

# Status kontenerów
docker compose ps
```

## 🌐 Dostęp

- **Strona publiczna**: https://giercujemy-staa.duckdns.org
- **Baza danych (z sieci lokalnej)**: `localhost:8200`
- **Frontend bezpośrednio**: `http://<IP-serwera>:9000`
