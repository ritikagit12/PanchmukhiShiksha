# Panchmukhi Shiksha Digitalization

## Project Overview
Panchmukhi Shiksha is an initiative at Banasthali Vidyapith that focuses on holistic education through five key aspects: **Physical, Practical, Moral, Intellectual, and Aesthetic**. This project aims to digitalize the Panchmukhi Shiksha scheme by providing an interactive website where users can access detailed information, register for activities, and communicate with faculty members.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time Chat:** Socket.io
- **Email Notifications:** Nodemailer
- **Hosting:** (Specify your hosting service, e.g., Vercel, Netlify, or AWS)

## Features
- **User Roles:**
  - **Admin:** Manages faculty, students, and system settings.
  - **Faculty:** Manages activity schedules, achievements, and communication.
  - **Student:** Registers for activities, views schedules, and communicates with faculty.
  - **Guest User:** Views basic information about Panchmukhi Shiksha.

- **Functional Modules:**
  - User authentication and role-based access.
  - Detailed information on each of the five categories.
  - Faculty details including qualifications, activity timings, achievements, and requirements.
  - Online registration for activities.
  - Real-time chat system between students and faculty.
  - Attendance tracking through facial recognition.
  - Email notifications for important updates.

## Database Schema (MongoDB)
- **Users Collection** (Stores different roles: Student, Faculty, Admin, Guest)
- **Students Collection** (Stores student-specific data)
- **Faculty Collection** (Stores faculty details and activities handled)
- **Activities Collection** (Details of Panchmukhi Shiksha activities)
- **Attendance Collection** (Stores attendance data using facial recognition)
- **Messages Collection** (Stores chat messages between students and faculty)

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/panchmukhi-shiksha.git
   cd panchmukhi-shiksha
   ```

2. Install dependencies for backend:
   ```sh
   cd backend
   npm install
   ```

3. Set up environment variables (`.env` file):
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODEMAILER_EMAIL=your_email
   NODEMAILER_PASSWORD=your_email_password
   ```

4. Start the backend server:
   ```sh
   npm start
   ```

5. Install dependencies for frontend:
   ```sh
   cd ../frontend
   npm install
   ```

6. Start the frontend application:
   ```sh
   npm start
   ```

## Deployment
- **Frontend:** Deploy on Netlify, Vercel, or any hosting service.
- **Backend:** Deploy on Render, AWS, or Heroku.
- **Database:** MongoDB Atlas (Cloud-based MongoDB service).

## Future Enhancements
- AI-powered chatbot for student queries.
- Integration of more interactive dashboards.
- Automated scheduling system for activities.

## Contributors
- **Ritika Shrivastava** (Lead Developer)

## License
This project is licensed under the MIT License.

## Contact
For any queries, contact **Ritika Shrivastava** at [your email].

