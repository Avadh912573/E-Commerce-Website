# E-Commerce-Website
This project is a modern and responsive E-commerce web application designed to provide a seamless online shopping experience. Users can browse products, search and filter items, add products to their cart, place orders, and manage their accounts.
 The platform includes secure authentication, product management, shopping cart functionality, order tracking, and an admin dashboard for inventory and order management.

## Quickstart

1. Clone the repo:
   git clone https://github.com/Avadh912573/E-Commerce-Website.git
2. Import DB schema:
   - Use `database/table.sql` to create tables and sample data.
3. Configure:
   - Copy `config/google.local.php` from `config/google.php` and set credentials if using OAuth.
   - Edit `config/conn.php` with your MySQL credentials.
4. Serve:
   - Place project in your local webroot (XAMPP: `C:\Program Files\Apache Software Foundation\Tomcat 11.0\webapps\ecommerce`) and visit `http://localhost:8080/ecommerce/frontend/ecommerce.html`.

## Requirements

- PHP 8.0+
- PDO extension (pdo_mysql)
- MySQL 5.7+ / MariaDB
- Composer (optional for dev tooling)
- Node.js + npm (optional for building assets)
- Tailwind CLI (if customizing CSS)

## Environment & Configuration

- config/conn.php — database connection (PDO). Enable exceptions and set proper charset (utf8mb4).
- config/google.php / config/google.local.php — Google OAuth configuration (optional).
- For production:
  - Disable PHP error display.
  - Set cookie options to secure and use HTTPS.
  - Store secrets outside webroot or use environment variables.

## Installation (detailed)

1. Ensure MySQL is running.
2. Import schema:
   mysql -u root -p your_db_name < database/table.sql
3. Update `config/conn.php`:
   - DSN, username, password, options (ERRMODE_EXCEPTION).
4. Seed admin user (if not included in SQL) via INSERT into `admins` table or use included seed script.

## Running Locally (Windows / XAMPP)

- Copy project to `C:\Program Files\Apache Software Foundation\Tomcat 11.0\webapps\ecommerce`.
- Start Apache & MySQL via XAMPP Control Panel.
- Open browser: `http://localhost:8080/ecommerce/frontend/ecommerce.html`.
- Admin panel: `http://localhost/E-commerce-website/admin/` (login route depends on project routes).

## Technologies Used
Frontend

HTML
CSS
Bootstrap
JavaScript
jQuery

Backend
PHP

Database
MySQL


