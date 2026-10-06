# CareQ 💊

CareQ is a medication management app built to make it easier for people, especially older adults, to understand their prescriptions and keep track of their medicines.

The idea is pretty simple:
You have a prescription, CareQ helps read it, turns the medicines into a manageable schedule, and reminds you when it's time to take them. It also includes features for caregivers so they can stay updated and help when needed.

## What can CareQ do?

- 📄 Scan and read prescriptions using AI
- 💊 Scan medicine strips and bottles
- 🕒 Turn prescription details into medication reminders
- ✅ Track whether a dose was taken or missed
- 👨‍👩‍👧 Support patient and caregiver workflows
- 🔎 Check possible medicine interactions
- 🗣️ Ask questions through the AI assistant in various languages
- 🔊 Read important information aloud for easier access
- 📱 Designed with older users and readability in mind

## How it works

The basic flow is:

**Prescription → AI extraction → Review → Medication schedule → Reminders**

CareQ does not automatically assume that an AI result is correct. Extracted prescription information is shown for review before it is saved into the medication schedule. ⚠️

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express
- Gemini API

**Other**
- Browser Notifications
- Web Speech API
- Web Audio API

## Current Status

CareQ is currently a working prototype / hackathon project.
Some parts of the application are still being improved, particularly authentication, persistent cloud storage, security, and production deployment.
The current version uses browser-based local storage for some application data, so it is not yet intended to be used as a production healthcare service.

## Why we built it

Managing multiple medicines can get confusing very quickly, especially when prescriptions contain different medicines, timings, dosages, and instructions.
We wanted to build something that takes some of that complexity away and presents the information in a much simpler way.

## What's next

Some of the improvements planned for CareQ include:

- Firebase Authentication
- Cloud-based data storage
- Better patient ↔ caregiver synchronization
- Stronger API security
- Better validation of AI-generated results
- More reliable notifications
- Improved accessibility and mobile experience
- Production deployment

## Screenshots
<img width="1900" height="1077" alt="image" src="https://github.com/user-attachments/assets/1155df38-f87d-4ab0-8992-faa7eeab222a" />
<img width="1901" height="1077" alt="image" src="https://github.com/user-attachments/assets/b4166ab1-a94b-4fe1-b45c-8c0942fd8033" />
<img width="1897" height="1077" alt="image" src="https://github.com/user-attachments/assets/38bcc487-0cb6-46b6-a69b-caf4ec902599" />
<img width="1895" height="1072" alt="image" src="https://github.com/user-attachments/assets/61baaf91-34a0-4702-a610-cd331b8d27ac" />







## Running CareQ Locally

Clone the repository:

```bash
git clone https://github.com/asrxznc/CareQ.git
cd CareQ
