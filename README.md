# 💸 RupeeSense — Your AI Financial Mirror

**Financial clarity for people who've never had it.**

An AI-powered personal finance app that analyzes your spending with personality, honesty, and a touch of shame. Get real feedback on your money habits—delivered like your mom would.

---

## ✨ Features

### 🏥 **Money Health Score**
Get a 0–100 wellness score based on your spending habits. Categories with high spending (food, entertainment, shopping) reduce your score. Transportation and utilities boost it.

### 💬 **Mom's Reaction**
Click any transaction and get an immediate, personality-driven response from your AI financial coach. Playful roasts for impulse spending, praise for responsible choices.

**Examples:**
- "₹450 Swiggy? Beta, aloo gobi at home free hai! 😤"
- "₹1200 Amazon?! Shaaram karo! Kitna jyada hai!"
- "₹50 auto? Theek hai beta, responsible hona zaroori hai. ✓"

### 📊 **Weekly Report Card**
Get grades (A+, A, B, C, D, F) for each spending category with brutal honesty:
- Food spending > ₹4000? **F - Disaster**
- Shopping always over budget? **C - Think again**
- Entertainment ratio high? **D - Too much fun**

### 📈 **Category Breakdown**
Visual bars showing your spending split across Food, Shopping, Entertainment, Transport, and Utilities. See where your money actually goes.

### 📋 **Bulk Import**
Paste multiple transactions at once:
```
450, Swiggy, Food, 2024-01-10
1200, Amazon, Shopping, 2024-01-10
340, Starbucks, Food, 2024-01-09
```

---

## 🎨 Design

Built with **Glassmorphism** aesthetic:
- Dark gradient background with animated blob animations
- Frosted glass cards with backdrop blur effect
- Semi-transparent UI elements with soft glowing borders
- Smooth transitions and hover states
- Gradient buttons (cyan to purple)
- Category-specific color coding

**Stack:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for fast builds
- No external API calls (all logic runs client-side)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Ananya9999999/RS.git
cd RS

# Install dependencies
npm install
# or
bun install

# Start dev server
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📱 How to Use

### **Step 1: Add a Transaction**
- Enter amount (₹)
- Enter merchant name (Swiggy, Amazon, etc.)
- Select category (Food, Shopping, Entertainment, Transport, Utilities)
- Pick date (defaults to today)
- Click **+ Add Transaction**

### **Step 2: See Mom's Reaction**
- Click any transaction in the list
- Wait for AI processing (100-300ms)
- Read the personality-driven response

### **Step 3: Check Your Health Score**
- View Money Health Score (top right)
- See category breakdown with percentage split
- Watch the colored progress bars

### **Step 4: Get Your Report Card**
- Click **📋 Get Weekly Report Card**
- See grades for each category
- Read overall judgment with context

### **Bulk Import** (Optional)
- Paste CSV-formatted data (amount, merchant, category, date)
- Click **📋 Import**
- All transactions load instantly

---

## 🏗️ Project Structure

```
RS/
├── src/
│   ├── App.tsx                 # Main component
│   ├── index.css               # Global styles
│   └── ...
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### Key Functions

**`getMomResponse()`** - Generates personality-driven feedback based on:
- Merchant name (pattern matching for Swiggy, Amazon, Netflix, etc.)
- Amount spent
- Transaction category
- Total weekly spending

**`generateReportCard()`** - Creates weekly grades:
- Analyzes spending by category
- Assigns letter grades (A+ to F)
- Provides overall judgment

**`calcHealthScore()`** - Calculates 0–100 score:
- Food spending ratio: -40 points (high impact)
- Entertainment ratio: -30 points
- Shopping ratio: -20 points
- Transport/Utilities: Neutral/Positive

---

## 💾 State Management

Uses React `useState` for:
- `transactions` - List of all spending entries
- `reportCard` - Generated weekly report
- Form inputs: `amount`, `merchant`, `category`, `date`, `pasteText`

All data is **client-side only** — nothing is sent to servers (except the deployment domain).

---

## 🎯 Hackathon Build (24-hour)

This was built for a 24-hour hackathon with:
- ✅ Zero external API calls (hardcoded logic)
- ✅ Instant responses (no network latency)
- ✅ Full functionality in < 500 lines of code
- ✅ Modern glassmorphism UI
- ✅ Mobile-responsive design

**Time breakdown:**
- Hours 0–6: Core logic + inputs (getMomResponse, transaction state)
- Hours 6–12: UI design (glassmorphism, categories)
- Hours 12–18: Report card + styling
- Hours 18–24: Polish, animations, deploy

---

## 🎨 Customization

### Change Mom's Personality
Edit `getMomResponse()` in `App.tsx`:

```typescript
if (merchant.includes('Swiggy')) {
  if (amount > 500) return '₹' + amount + ' Swiggy? [YOUR RESPONSE HERE]';
}
```

### Adjust Health Score Formula
Modify weights in `calcHealthScore()`:

```typescript
const score = Math.max(0, 100 - (
  foodRatio * 40 +           // Change 40 to adjust weight
  entertainmentRatio * 30 +
  shoppingRatio * 20
));
```

### Add New Categories
In the `<select>` dropdown:

```tsx
<option>Your Category Here</option>
```

Then add matching logic in `getMomResponse()`.

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS variables |
| **Build** | Vite, npm/bun |
| **Logic** | Pure JavaScript (no external libs) |
| **Deployment** | Lovable (no-code) |

---

## 📊 Features Breakdown

| Feature | Status | Lines of Code |
|---------|--------|---------------|
| Add transactions | ✅ | 25 |
| Bulk import | ✅ | 30 |
| Health score calc | ✅ | 15 |
| Mom's response logic | ✅ | 50 |
| Report card gen | ✅ | 60 |
| UI/Glassmorphism | ✅ | 200+ |
| Category breakdown | ✅ | 40 |

---

## 🚀 Deployment

**Live:** https://rupeesense.lovable.app

### Deploy Your Own

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm run build
# Drag dist/ folder to Netlify
```

**Option 3: GitHub Pages**
```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## 🎓 Learning & Future Work

### Possible Enhancements
- [ ] Real UPI SMS parsing (Android intent/accessibility service)
- [ ] Cloud sync (Supabase/Firebase)
- [ ] Fraud detection (anomaly scoring)
- [ ] Multi-user support with auth
- [ ] Historical data & trends
- [ ] Export reports (PDF)
- [ ] Dark/light mode toggle
- [ ] Localization (more languages)

### Known Limitations
- ✋ No real SMS integration (manual input only)
- ✋ No fraud detection (basic rules only)
- ✋ No cloud storage (browser-only)
- ✋ Merchant detection is regex-based (not ML)

---

## 👤 Author

**Ananya** — VIT Chennai, AI & Robotics specialization  
Built in 24 hours for hackathon. Designed for Indian fintech market.

---

## 📝 License

MIT — Use, modify, and share freely.

---

## 🙏 Acknowledgments

- Inspired by real pain point: wage workers with ₹0 visibility into spending
- Mom-voice personality design (desi financial coaching)
- Glassmorphism trend (modern, sleek aesthetic)
- Hackathon sprint: prioritize demo over perfection

---

## 📞 Support

**Issues?** Open a GitHub issue or reach out.

**Want to contribute?** Fork, improve, and send a PR.

---

**Start tracking. Get roasted. Take control. 💪**

*"Financial clarity through mom's wisdom."*