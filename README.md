# Dayflow HRMS

Every workday, perfectly aligned. A Human Resource Management System — plain
HTML/CSS/JS + Three.js frontend, Node.js + Express backend, PostgreSQL database.

## Project Structure

```
dayflow-hrms/
├── backend/
│   ├── config/          # db.js (PostgreSQL pool), config.js (env reader)
│   ├── database/        # schema.sql, seed.js
│   ├── models/          # User, Employee, Attendance, LeaveRequest, Salary, BankDetails
│   ├── controllers/     # business logic for each route group
│   ├── routes/          # Express route definitions
│   ├── middleware/      # auth, role-check, error handler, validation
│   ├── services/        # payroll math, attendance logic, email
│   ├── utils/           # login-ID generator, JWT helpers, date helpers
│   ├── app.js            # Express app + middleware wiring
│   ├── server.js         # entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html         # Sign In (with 3D Flow Ring)
    ├── signup.html
    ├── dashboard-admin.html
    ├── dashboard-employee.html
    ├── profile.html
    ├── attendance.html
    ├── leave.html
    ├── payroll.html
    ├── css/               # style.css, responsive.css, animations.css
    └── js/                # api.js, page scripts, three.js scene files
```

## 1. Set up the database

```bash
# create the database
createdb dayflow_db

# apply the schema
psql -U postgres -d dayflow_db -f backend/database/schema.sql
```

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your actual DB credentials and a real JWT_SECRET

npm run db:seed   # optional: creates a demo admin + employee
npm run dev        # starts the API on http://localhost:5000
```

Demo login (after seeding):
- **Admin:** `priya.sharma@dayflow.com` / `Admin@123`
- **Employee:** `john.doe@dayflow.com` / `Employee@123`

## 3. Run the frontend

The frontend is plain static files — no build step. Serve it with any static
server, e.g.:

```bash
cd frontend
npx serve .          # or: python3 -m http.server 5500
```

Open the printed URL (e.g. `http://localhost:5500`). Make sure the `CLIENT_URL`
in `backend/.env` matches the port you serve the frontend on, so CORS allows it.

## 4. Try it out

1. Open `index.html` — sign in with the demo employee account.
2. Check in on the dashboard, then visit **Attendance** to see the record.
3. Apply for leave under **Time Off**.
4. Sign out, sign back in as the demo admin — approve/reject the leave request
   from the dashboard, view the employee list, and set a wage on **Payroll**
   to see the auto-calculated salary breakdown.

## Notes & things to harden before production

- `authController.signup` currently allows self-signup for convenience during
  development. In the real product, only Admin/HR create employee accounts
  (see `employeeController.createEmployee`, which generates a login ID and
  temporary password) — you'll likely want to remove or restrict the public
  signup form.
- Login IDs and temporary passwords are logged to the response for demo
  purposes; in production these should be delivered securely (e.g. emailed).
- Add rate limiting and stronger password hashing rounds before deploying.
- The Three.js "Flow Ring" scene loads Three.js from a CDN — swap in a
  self-hosted copy if you need to work offline or want tighter version control.
