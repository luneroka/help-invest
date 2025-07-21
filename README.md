# HELP-INVEST

HELP-INVEST is a portfolio visualization tool that lets users dynamically track and visualize their investments across categories. The app provides interactive graphs and tables to help you understand your portfolio allocation and evolution over time. Authentication is handled securely via Firebase.

The entire app was fully designed in [Figma](https://www.figma.com/design/lELnfIX5lB8fBOr428PVmy/help-invest?node-id=15-527&t=DG0Sj8OBKxWuo7TT-1).

## 📸 Screenshots


**Home Page**:
![helpInvest-Home](https://github.com/luneroka/help-invest/blob/main/frontend/public/helpinvest-index.png)

**Dashboard**:
![helpInvest-Dashboard](https://github.com/luneroka/help-invest/blob/main/frontend/public/helpinvest-dashboard.png)


- **User Authentication (Firebase):** Login, sign-up, change password.
- **Set Risk Profile:** Choose a risk profile between low, moderate or high for your own reference.
- **Portfolio Management:** Add, view, delete investments; track transactions.
- **Dashboard:** Graph and table view of your investments in each category (Savings, Real Estate and Stock Market)

## 🛠️ Tech Stack

- **Database:** PostgreSQL
- **Backend:** Flask (Python)
- **Frontend:** React 18 (Vite, JavaScript, CSS)
- **Styling:** CSS, Tailwind CSS
- **Dev Tools:** Vite, ESLint, Prettier
- **Version Control:** Git, GitHub
- **Containerization:** Docker (including Docker Compose for multi-container setup)

## 🐳 Docker & Development Setup

This project is fully containerized for development and deployment using Docker. The frontend is now a modern React app powered by Vite.

### 📦 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### ⚙️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/luneroka/help-invest.git
   cd help-invest
   ```

2. **Set up environment variables**:
   - Copy `backend/.env.example` to `backend/.env` and fill in your secrets and database credentials.
   - Copy `frontend/.env.example` to `frontend/.env` and fill in your Vite and Firebase secrets.

3. **Run the containers**:
   ```bash
   docker-compose up --build
   ```

4. **Access the app**:
   - **Frontend (React):** [http://localhost:5173](http://localhost:5173)
   - **Backend (Flask API):** [http://localhost:5001](http://localhost:5001)

The React frontend will proxy API requests to the Flask backend automatically during development.

---

## 🧑‍💻 Frontend (React + Vite)

- Source code: `frontend/`
- Main entry: `frontend/src/main.jsx`
- To run the frontend only (for development):
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- The app will be available at [http://localhost:5173](http://localhost:5173)

## 🐍 Backend (Flask)

- Source code: `backend/app/`
- Main entry: `backend/app/main.py`
- Flask runs on port 5001 inside Docker

---

## 🧪 Unit Testing (Vitest + React Testing Library)

Unit tests for the frontend are written using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

### Running Tests

1. **Install dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Run all tests**:
   ```bash
   npm run test
   ```

3. **Watch mode** (for live feedback during development):
   ```bash
   npm run test:watch
   ```

### Test Files

- Test files are located alongside components in `frontend/src/` and use the `.test.jsx` or `.test.tsx` extension.
- Example test file: `frontend/src/components/SomeComponent.test.jsx`

### Example Test (React Component)

```jsx
import { render, screen } from '@testing-library/react'
import SomeComponent from './SomeComponent'

test('renders the component', () => {
  render(<SomeComponent />)
  expect(screen.getByText(/hello/i)).toBeInTheDocument()
})
```

For more information, see the [Vitest documentation](https://vitest.dev/) and [React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/).

## 🙏 Credits

This project was completed as part of the Harvard CS50 final project.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
