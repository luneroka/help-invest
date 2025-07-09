# HELP-INVEST

**Video Demo:** [Watch here](https://youtu.be/tMvmXQEJahI)

HELP-INVEST is a portfolio management tool that helps users track their investments across categories, compare their portfolio with personalized recommendations based on their risk profile, and make informed decisions.

## 📸 Screenshots

**Home Page**:
![helpInvest-Dashboard](https://github.com/luneroka/help-invest/blob/main/static/helpinvest-dash.png)

## 📚 Features

- **User Authentication:** Login, sign-up, change password.
- **Set Risk Profile:** Choose a risk profile between low, moderate or high.
- **Portfolio Management:** Add, view, delete investments; track transactions.
- **Dashboard:** Table view of your investments in each category (Savings, Real Estate and Stock Market)
- **Recommendations:** Get recommendation on your current vs expected portfolio balance, based on your risk profile.

## 🛠️ Tech Stack

- **Database:** PostgreSQL
- **Backend:** Flask
- **Frontend:** Jinja, JavaScript, Bootstrap
- **Version Control:** Git, GitHub
- **Containerization:** Docker (including Docker Compose for multi-container setup)

## 🐳 Docker Setup

This project is fully containerized for development and deployment using Docker.

### 📦 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### ⚙️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/luneroka/help-invest.git
   cd help-invest
   ```

2. **Create a `.env` file**:
   Copy the `.env.example` or create one manually with at least the following:
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://postgres:yourpassword@db:5432/helpinvest
   ```

3. **Run the containers**:
   ```bash
   docker-compose up --build
   ```

4. **Access the app**:
   Open your browser at [http://localhost:5000](http://localhost:5000)

## 🙏 Credits

This project was completed as part of the Harvard CS50 final project.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
