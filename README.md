# MediBata

## 1. Project Overview

### App Name
**MediBata**

### Description
MediBata is a mobile application that helps Barangay Health Workers (BHWs) and parents living in Mapaniqui, Pampanga monitor children's nutrition levels and receive diet recommendations. It addresses malnutrition and obesity among children aged 2–17 through logging BMI records, providing appropriate nutrition plans and announcement notifications of barangay health programs for children.

---

## 2. Key Features

### Barangay Health Workers (Admin)
1.	Manage children’s profiles and log height and weight records.
2.	Calculate their BMI and automatically classify their nutritional status.
3.	Publish weekly nutrition plans according to children’s nutritional status.
4.	Publish announcements for barangay programs for pediatric healthcare.
5.	Verify registration of parent accounts and link them to children’s health records.
6.	View statistics on children’s health records and registered parent accounts.


### Parents (Users)
1.	Register for a user account.
2.	View their children’s profile and nutritional status.
3.	View personalized weekly nutrition plans for their children.
4.	Receive health program announcements.
5.	Update their children's profile and measurements with photo evidence.

---

## 3. Getting Started

### Prerequisites
- Node.js
- npm
- Visual Studio Code
- Android Studio
- Android SDK
- Android 8.0+ device or emulator
- Git

### Installation

```bash
git clone https://github.com/yourusername/medibata.git
cd medibata
npm install
```

### Running the App

#### Start the Development Server

```bash
npm run start
```

#### Build Android APK using Capacitor

```bash
npx cap sync
npx cap open android
```

Then build the APK through Android Studio.

---

## 4. Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend Logic: JavaScript
- Mobile Framework: Capacitor
- Local Database: SQLite
- IDE: Visual Studio Code
- APK Build Tool: Android Studio

---

## 5. Configuration

- Ensure Node.js and npm are properly installed.
- Install project dependencies using:

```bash
npm install
```

- Initialize Capacitor configuration:

```bash
npx cap init
```

- Add Android platform support:

```bash
npx cap add android
```

- Synchronize project files before building:

```bash
npx cap sync
```

- Open the Android project in Android Studio:

```bash
npx cap open android
```

- SQLite is used as the local database for offline data storage.

---

## 6. License & Copyright

### Copyright
© 2026 MediBata. All rights reserved.

This project was developed by students of Bachelor of Science in Information Technology under Bulacan Agricultural State College as part of an academic requirement for IT 321.

The system is intended for implementation and use by the Barangay Health Center of Mapaniqui, Pampanga, subject to approval and coordination with the developers.

### License
This software is a proprietary academic-developed system.

- It may be used, installed, and deployed only by the Barangay Health Center of Mapaniqui, Pampanga, with permission from the developers.
- Redistribution, modification, or commercial use by other parties is strictly prohibited without written consent from the development team.
- The source code remains the intellectual property of the developers unless formally transferred through written agreement.