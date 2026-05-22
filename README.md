# GigProfit — Earnings Intelligence for Gig Drivers

A production-ready React Native (Expo) app for gig economy drivers to track real profitability across Uber, Lyft, DoorDash, Amazon Flex, Instacart, Grubhub, and more.

Runs natively on **Android**, **iOS**, and **Web** from a single codebase.

---

## ✦ Features

### Dashboard
- Real-time Net Profit badge (updates with each period filter)
- Period toggle: Day / Week / Month / Year
- KPI cards: Gross, Expenses, Net Profit, Hourly Rate
- Per-mile breakdown: Earned/mi · Cost/mi · Net/mi
- 7-day earnings vs costs bar chart
- Tax snapshot with IRS mileage deduction ($0.67/mi, 2025 rate)
- Smart profit/loss alerts
- AI Profit Coach (powered by Claude — tap "Get Tips")

### Log Trip
- Quick trip entry: date, platform, miles, hours, gross, tolls/parking, note
- Live cost preview as you type — shows fuel, depreciation, maintenance, net
- Platform dropdown: Uber, Lyft, DoorDash, Amazon Flex, Instacart, Grubhub, Uber Eats, Shipt, Other
- Trip history (last 30 trips) with long-press to delete
- Data persists locally via AsyncStorage

### Analytics
- 14-day earnings trend chart
- Platform-by-platform performance: net, margin %, hourly rate
- Full expense breakdown: Fuel, Depreciation, Maintenance, Tires, Oil, Insurance, Loan
- P&L Summary: Gross → Net → After-Tax Take-Home
- Smart alerts: loss detection, high cost/mile, low hourly rate, platform comparison

### Vehicle Settings
- 9 cost parameters with stepper controls
- Live cost-per-100-mile preview
- Data summary (total trips, miles, hours)
- Reset to defaults / Clear all data

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go app on your phone (for development)

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm start

# Then:
# Press 'a' for Android (needs Android emulator or Expo Go)
# Press 'i' for iOS (macOS only, needs Xcode or Expo Go)
# Press 'w' for Web browser
```

### Run on your phone (easiest)
1. Install **Expo Go** from App Store / Google Play
2. Run `npm start`
3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

---

## 📱 Building for Production

### Setup EAS (Expo Application Services)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Android APK / AAB

```bash
# Preview APK (for direct install / testing)
eas build --platform android --profile preview

# Production AAB (for Google Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Requires Apple Developer account ($99/yr)
eas build --platform ios --profile production
```

### Web

```bash
# Export static web build
npx expo export --platform web

# Output is in /dist — deploy to Netlify, Vercel, or any static host
```

---

## 🌐 Web Deployment (Netlify / Vercel)

```bash
npx expo export --platform web
```

Then drag the `/dist` folder to [Netlify Drop](https://app.netlify.com/drop) or run:

```bash
npx vercel dist/
```

---

## 🏪 App Store Submission

### Google Play Store
1. `eas build --platform android --profile production`
2. Download the `.aab` file
3. Upload to [Google Play Console](https://play.google.com/console)
4. Fill in store listing, screenshots, privacy policy
5. Submit for review

### Apple App Store
1. `eas submit --platform ios` (submits automatically after build)
   — or —
2. Download `.ipa` → upload via Transporter app
3. Complete listing in [App Store Connect](https://appstoreconnect.apple.com)
4. Submit for review

---

## 🗂 Project Structure

```
gigprofit/
├── App.js                          # Root: navigation + providers
├── app.json                        # Expo configuration
├── eas.json                        # Build profiles
├── src/
│   ├── context/
│   │   └── AppContext.js           # Global state + AsyncStorage
│   ├── screens/
│   │   ├── DashboardScreen.js      # Main dashboard + AI coach
│   │   ├── LogTripScreen.js        # Trip logging + history
│   │   ├── AnalyticsScreen.js      # Deep analytics + P&L
│   │   └── SettingsScreen.js       # Vehicle settings
│   ├── components/
│   │   └── UI.js                   # Shared UI components
│   └── utils/
│       ├── calculations.js         # All financial math
│       └── theme.js                # Design tokens
└── assets/                         # Icons + splash screens
```

---

## 💰 Cost Calculations

GigProfit calculates true per-trip cost using:

| Cost | Method |
|------|--------|
| Fuel | `(miles / mpg) × fuel_price` |
| Depreciation | `miles × $/mi` (IRS: $0.08–0.10) |
| Maintenance | `miles × $/mi` (avg $0.04) |
| Tire wear | `miles × $/mi` (avg $0.012) |
| Oil changes | `(miles / interval) × cost` |
| Insurance | Pro-rated from monthly cost |
| Loan/Lease | Pro-rated from monthly payment |

**Tax estimate**: Self-employment tax (15.3% on 92.35% of net) + income tax (22% bracket estimate).

**IRS Mileage Deduction**: $0.67/mile for 2025 — shown as an alternative to actual expense tracking.

---

## 🔑 AI Coach Setup

The AI Profit Coach uses the Anthropic Claude API via `https://api.anthropic.com/v1/messages`.

The app calls the API directly from the client. For production, **route through your own backend** to protect your API key:

```javascript
// Replace in DashboardScreen.js:
const res = await fetch('https://your-backend.com/api/ai-tips', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
  body: JSON.stringify({ stats }),
});
```

---

## 🎨 Design System

- **Color scheme**: Dark (#0a0c10 bg) with neon green (#00e5a0) accent
- **Typography**: System fonts with tight weight hierarchy (300–900)
- **Spacing**: 4/8/16/24/32px scale
- **Border radius**: 8/12/16/24px scale

Customize colors in `src/utils/theme.js`.

---

## 📋 Roadmap / Future Features

- [ ] GPS automatic mileage tracking (expo-location)
- [ ] Gig platform API integrations
- [ ] Push notifications for slow-period alerts
- [ ] CSV/PDF export of trip history
- [ ] Cloud sync (Supabase / Firebase)
- [ ] Multi-vehicle support
- [ ] Weekly/monthly email summaries
- [ ] Mileage log for IRS compliance

---

## 📄 License

MIT License — build, extend, ship.
