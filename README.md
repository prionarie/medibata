# MediBata: Children's Nutritional Status Monitoring and Diet Planning App

MediBata is a mobile application that helps Barangay Health Workers (BHWs) and parents living in Mapaniqui, Pampanga monitor children's nutrition levels and receive diet recommendations. It addresses malnutrition and obesity among children aged 2–17 through logging BMI records, providing appropriate nutrition plans and announcement notifications of barangay health programs for children.

<<<<<<< HEAD
=======
![MediBata Home Page](/screenshots/medibata.png)
>>>>>>> d4b1611 (medibata sqlite configuration and build apk with gradle)

## 2. Key Features

**For a detailed guide, view the user manual:**  [Medibata User Manual](/assets/usermanual.pdf)

## 1. Key Features

### Barangay Health Workers (Admin)
1.	Manage children’s profiles and log height and weight records.
2.	Calculate their BMI and automatically classify their nutritional status.
3.	Publish weekly nutrition plans according to children’s nutritional status.
4.	Publish announcements for barangay programs for pediatric healthcare.
5.	Verify registration of parent accounts and link them to children’s health records.
6.	View statistics on children’s health records and registered parent accounts.

<p align="left">
  <img src="screenshots/admin_image1.png" width="45%" alt="Admin Screen 1" />
  <img src="screenshots/admin_image2.png" width="45%" alt="Admin Screen 2" />
</p>

### Parents (Users)
1.	Register for a user account.
2.	View their children’s profile and nutritional status.
3.	View personalized weekly nutrition plans for their children.
4.	Receive health program announcements.
5.	Update their children's profile and measurements with photo evidence.

<<<<<<< HEAD
## 3. Getting Started
=======
<p align="left">
  <img src="screenshots/parent_image1.png" width="45%" alt="Parent Screen 1" />
  <img src="screenshots/parent_image2.png" width="45%" alt="Parent Screen 2" />
</p>

## 2. Tech Stack
>>>>>>> d4b1611 (medibata sqlite configuration and build apk with gradle)

| Layer | Technologies |
|---|---|
| **Frontend** | HTML, CSS, JavaScript |
| **Database** | SQLite |
| **APK Build Tool** | Gradle |

## 3. Installation

**MediBata Mobile App**

1. Locate the executable APK in "android/app/build/outputs/apk/app-depug.apk"
2. Simply download and open the APK to run the app
 
For developers, please follow the procedures for project installation and APK configuration:

### 3.1. Prerequisites
Please download the following:
- Java SDK 21
- Android SDK

### 3.2. Installation

```bash
git clone https://github.com/prionarie/medibata.git
cd medibata
npm install
```

### 3.3. Running the App

- Open `www/index.html` directly in a browser or run:

```bash
npx serve www
```

<<<<<<< HEAD
#### Build Android APK using Capacitor

```bash
npx cap sync
npx cap open android
```

Then build the APK through Android Studio.

## 4. Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend Logic: JavaScript
- Mobile Framework: Capacitor
- Local Database: SQLite
- IDE: Visual Studio Code
- APK Build Tool: Android Studio

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
=======
### 3.4. Build Android APK
>>>>>>> d4b1611 (medibata sqlite configuration and build apk with gradle)

- Synchronize project files before building:

```bash
    npx cap sync android
```

- Build APK

```bash
    cd android
    ./gradlew assembleDebug
```
- The APK is written to `android/app/build/outputs/apk/debug/`.
- SQLite is used as the local database for offline data storage.

<<<<<<< HEAD
## 6. License & Copyright
=======
## 4. License & Copyright
>>>>>>> d4b1611 (medibata sqlite configuration and build apk with gradle)

### Copyright
© 2026 MediBata. All rights reserved.

This project was developed by students of Bachelor of Science in Information Technology under Bulacan Agricultural State College as part of an academic requirement for IT 321.

The system is intended for implementation and use by the Barangay Health Center of Mapaniqui, Pampanga, subject to approval and coordination with the developers.

### License
This software is a proprietary academic-developed system.

- It may be used, installed, and deployed only by the Barangay Health Center of Mapaniqui, Pampanga, with permission from the developers.
- Redistribution, modification, or commercial use by other parties is strictly prohibited without written consent from the development team.
- The source code remains the intellectual property of the developers unless formally transferred through written agreement.
