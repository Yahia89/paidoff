# PaidOff 💳

A modern, lightweight, serverless web application to track money owed to business partners, suppliers, and wholesalers, plan repayments, and calculate payoff balances.

Built strictly with clean **HTML5, Vanilla CSS, and modern JavaScript**, with **zero dependencies, zero node_modules, and zero build step required**. It works right out of the box locally or hosted directly on **GitHub Pages**.

---

## ✨ Features

- **Executive Financial Dashboard**:
  - **Total Currently Owed**: Net unpaid balance across all suppliers.
  - **Total Paid Back**: Sum of all recorded repayments and payback percentage.
  - **Total Incurred Debt**: Complete cumulative ledger total.
  - **Partners Overview**: Total suppliers and active count with pending balances.

- **Interactive Payoff Calculator**:
  - Select any partner or wholesaler.
  - Enter an amount or click **"Pay In Full"** to simulate the impact.
  - Real-time balance preview showing current balance $\to$ remaining balance.
  - One-click **"Apply Payment"** button that immediately records the repayment to the ledger.

- **Partner & Wholesaler Management**:
  - Add, edit, and delete partners with categories (*Wholesaler*, *Supplier*, *Lender*, *Contractor*).
  - Supplier cards with live repayment progress bar, total incurred, and net balance owed.
  - Quick action buttons to directly record debt or repayments.

- **Complete Ledger & Filtering**:
  - Filter ledger by partner or entry type (*Money Owed* vs. *Payments Made*).
  - Search entries by description, invoice number, or partner name.
  - Badges for entry category (*Inventory*, *Wholesale Batch*, *Equipment*, *Bank Transfer*, *Check*).

- **Data Privacy & Backup**:
  - **Offline-First**: All data is automatically saved to browser `LocalStorage`.
  - **JSON Backup & Restore**: Export and import full data snapshots anytime.
  - **CSV Export**: Export your complete transaction history to Excel or Google Sheets.
  - **Print / PDF Statement**: Clean print layout to print or save partner statements.
  - **Dark / Light Theme**: Seamless toggle between sleek dark mode and clean light mode.

---

## 🚀 How to Run Locally

Because PaidOff is a pure client-side application, you can simply:

1. Double-click `index.html` to open it directly in any browser (Chrome, Safari, Edge, Firefox).
2. Or serve it with any lightweight local server:
   ```bash
   # Using Python
   python3 -m http.server 8080
   ```
   Then open `http://localhost:8080`.

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PaidOff project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** $\to$ **Pages**.
   - Under **Build and deployment** $\to$ **Source**, choose **Deploy from a branch**.
   - Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
3. In a few moments, GitHub Pages will provide your live URL: `https://<your-username>.github.io/<your-repo-name>/`.
# paidoff
