# 🛒 E-Commerce Website

A modern and responsive E-Commerce web application designed to provide a seamless online shopping experience. Users can browse products, search and filter items, add products to their cart, place orders, and manage their accounts. The platform includes secure authentication, product management, shopping cart functionality, order tracking, and an admin dashboard for inventory and order management.

---

## ✨ Features

* User Authentication & Authorization
* Product Search and Filtering
* Shopping Cart Management
* Order Placement & Tracking
* Admin Dashboard
* Inventory Management
* Responsive User Interface
* Secure Database Integration

---

## 🚀 Quick Start

### Clone the Repository

```bash
git clone https://github.com/Avadh912573/E-Commerce-Website.git
cd E-Commerce-Website
```

### Import Database Schema

* Import `database/table.sql` into MySQL.
* This will create the required tables and sample data.

### Configure the Application

* Edit `config/conn.php` with your MySQL credentials.
* If using Google OAuth:

  * Copy `config/google.php`
  * Create `config/google.local.php`
  * Add your Google OAuth credentials

### Run the Project

1. Place the project inside your web server directory.
2. Start Apache/Tomcat and MySQL.
3. Open:

```text
http://localhost:8080/ecommerce/frontend/ecommerce.html
```

---

## 📋 Requirements

* PHP 8.0+
* MySQL 5.7+ / MariaDB
* PDO MySQL Extension (`pdo_mysql`)
* Apache/Tomcat Server
* Composer (Optional)
* Node.js & npm (Optional)
* Tailwind CLI (Optional)

---

## ⚙️ Installation

### 1. Start MySQL

Ensure that MySQL is running.

### 2. Import Database

```bash
mysql -u root -p your_database_name < database/table.sql
```

### 3. Configure Database Connection

Update the following file:

```text
config/conn.php
```

Set:

* Database Name
* Username
* Password
* PDO Options

### 4. Seed Admin Account

If not already included in the SQL file, create an admin user manually.

---

## 🛠️ Technologies Used

### 🎨 Frontend

* HTML5
* CSS3
* Bootstrap
* JavaScript
* jQuery

### ⚙️ Backend

* PHP

### 🗄️ Database

* MySQL

---

## 🔒 Security Recommendations

For Production Deployment:

* Disable PHP error display
* Enable HTTPS
* Use Secure Cookies
* Store secrets outside the web root
* Use Environment Variables for credentials

---

## 📂 Project Structure

```text
E-Commerce-Website/
│
├── frontend/
├── admin/
├── config/
├── database/
├── assets/
├── README.md
└── ...
```

---

## 👨‍💻 Author

**Avadhesh Kumar Bind**

B.Tech CSE (AI) | Galgotias University

GitHub: https://github.com/Avadh912573
