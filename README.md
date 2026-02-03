# FOSSEE Data Visualizer and Analytics Suite

A ***sophisticated***, multi-platform data engineering solution developed for the **FOSSEE** technical submission. This system integrates a ***centralized*** Django REST API with both a **native Desktop application** and a **modern Web interface**.

---

## Technical Overview

The suite is engineered to handle *industrial-grade* equipment sensor data, providing ***deep insights*** through automated statistical analysis and professional-grade document generation.

### Core Architecture
The system utilizes a ***unified backend*** to serve diverse clients, ensuring data consistency across all platforms.

- **Backend**: Django REST Framework with SQLite.
- **Data Engine**: *Pandas* for high-speed processing and validation.
- **Reporting**: *ReportLab* and *Seaborn* for advanced PDF analytics.
- **Clients**: Native **PyQt5 Desktop** and **React Vite Web** applications.

---

## Key Features

- **Centralized Authentication**: Secure, *token-based* user management across all platforms.
- **High-Volume Data Support**: Optimized to process CSV uploads up to ***25,000 rows***.
- **Native Experience**: A **premium PyQt5** desktop interface featuring *dark-mode aesthetics* and *fluid animations*.
- **Equipment Analytics Reports**: Generation of ***comprehensive PDF reports*** including executive summaries, metric distributions, and correlation matrices.
- **Interactive Visualizations**: Dynamic charting using *Matplotlib* and *Chart.js* tailored for industrial metrics.

---

## Installation and Setup

### 1. Backend Service
Prepare the API environment by navigating to the backend directory and executing the following:

**cd backend**

**python -m venv venv**

**.\venv\Scripts\activate**

**pip install -r requirements.txt**

**python manage.py migrate**

**python manage.py createsuperuser**

**python manage.py runserver**

### 2. Desktop Application
Initialize the native desktop client:

**cd desktop-app**

**python -m venv venv_desktop**

**.\venv_desktop\Scripts\activate**

**pip install -r requirements.txt**

**python main.py**

### 3. Web Interface
Deploy the React-based web frontend:

**cd frontend**

**npm install**

**npm run dev**

---

## API Reference

| Endpoint | Method | Result |
| :--- | :--- | :--- |
| /api/auth/login/ | **POST** | *Authentication Token* |
| /api/upload/ | **POST** | *Data Ingestion and Validation* |
| /api/history/ | **GET** | *Secure Dataset Repository* |
| /api/report/id/ | **GET** | *Comprehensive PDF Analysis* |

---

## Deployment (Bonus)

To host the web version of this suite online, follow these professional deployment steps:

### 1. Backend (Render.com)
- Connect your GitHub repository to **Render**.
- Choose **Web Service**.
- Build Command: **sh build.sh**
- Start Command: **gunicorn config.wsgi:application**
- Add Environment Variables:
  - **PYTHON_VERSION**: 3.10.x
  - **RENDER**: True
  - **SECRET_KEY**: (A long random string)

### 2. Frontend (Vercel.com)
- Connect your GitHub repository to **Vercel**.
- Select the **frontend** directory.
- Add Environment Variable:
  - **VITE_API_URL**: (Your Render Web Service URL + /api)

---

## Submission Details

- **Live Web App**: *https://dataset-analyzer-qwl9.vercel.app/*
- **Admin Dashboard**: *https://fossee-backend-3m56.onrender.com/admin*
- **Demo Video**: *https://drive.google.com/file/d/1kbJy55hcEgc0zcgSg9HaK-NCisSGSn97/view?usp=sharing*
- **Developer**: **Soumyodyuti Ray**
- **Project Scope**: *FOSSEE Technical Assignment*
- **System Version**: ***1.0.0***

---
*Created by the Soumyodyuti Ray | 2026*
