# Design System — Air Quality Prediction System (AirGuard)

## 1. Project Overview

Design a modern, professional, responsive web application for an **Air Quality Prediction System (AirGuard)**.

The application allows users to:
- Enter environmental parameters.
- Predict the Air Quality Index (AQI).
- View AQI categories and health recommendations.
- Monitor air quality through interactive dashboards.
- View previous prediction history.
- Download prediction reports.

The application must have a clean, premium interface using a **white and blue visual theme**.

### Technology Stack
- **Frontend**: React.js
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Machine Learning**: Python, Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

---

## 2. Design Principles

Follow these principles throughout the application:

### 2.1 Clean and Minimal Design
- Use a white background as the primary surface.
- Avoid unnecessary decorative elements.
- Maintain sufficient spacing between sections.
- Use simple cards and clearly defined content areas.
- Keep the interface professional and uncluttered.

### 2.2 Consistency
- Use consistent typography, colors, buttons, cards, and spacing.
- Maintain the same navigation structure across pages.
- Use reusable UI components.
- Apply consistent interaction and hover states.

### 2.3 User-Friendly Interface
- Make important information easy to understand.
- Use clear labels for environmental input fields.
- Display validation errors near the relevant fields.
- Present AQI results prominently.
- Provide understandable health recommendations.

### 2.4 Responsive Design
The application must work properly on:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

Use responsive layouts, flexible grids, and mobile-friendly navigation.

---

## 3. Color Palette

Use a white and blue color system throughout the frontend.

### 3.1 Primary Colors

| Purpose | Color | Hex Code |
| :--- | :--- | :--- |
| Primary Blue | Blue | `#2563EB` |
| Dark Blue | Navy | `#1E40AF` |
| Light Blue | Pale Blue | `#EFF6FF` |
| White | Main Background | `#FFFFFF` |
| Page Background | Light Gray | `#F8FAFC` |
| Border | Soft Gray | `#E2E8F0` |

### 3.2 Text Colors

| Purpose | Color | Hex Code |
| :--- | :--- | :--- |
| Primary Text | Slate Dark | `#0F172A` |
| Secondary Text | Slate Medium | `#475569` |
| Muted Text | Slate Muted | `#64748B` |
| White Text | Pure White | `#FFFFFF` |

### 3.3 AQI Category Colors

Use category-specific colors only for AQI indicators, charts, badges, and status information:

| AQI Category | Color | Hex Code |
| :--- | :--- | :--- |
| Good | Green | `#16A34A` |
| Satisfactory | Light Green | `#84CC16` |
| Moderate | Yellow | `#EAB308` |
| Poor | Orange | `#F97316` |
| Very Poor | Red | `#DC2626` |
| Severe | Dark Red | `#7F1D1D` |

> *Note: Use the AQI classification standard selected for the project. Do not assume that sample threshold ranges are final.*

---

## 4. Typography

Use **Inter** as the primary font throughout the application.

| Element | Font Size | Font Weight |
| :--- | :--- | :--- |
| Main Page Heading | 30–32px | Bold (700) |
| Section Heading | 22–24px | Semibold (600) |
| Card Heading | 16–18px | Semibold (600) |
| Body Text | 14–16px | Regular (400) |
| Labels | 13–14px | Medium (500) |
| Small Metadata | 12px | Regular (400) |
| AQI Main Value | 40–48px | Bold (700) |

### Typography Requirements
- Use clear text hierarchy.
- Maintain readable line spacing.
- Avoid excessive font sizes.
- Use consistent heading styles.

---

## 5. Layout and Structure

Use a professional dashboard layout.

### 5.1 Main Application Layout
The application should contain:
1. Sidebar navigation.
2. Top navigation bar.
3. Main content area.
4. Page title and description.
5. Dashboard cards and charts.
6. Footer where appropriate.

### 5.2 Sidebar
Use a white sidebar with a subtle right border (`#E2E8F0`).

Include:
- Application logo and name (**AirGuard**).
- Dashboard
- AQI Prediction
- Prediction History
- Air Quality Analytics
- Reports
- Settings

**Active Navigation Item Styling:**
- Light blue background (`#EFF6FF`).
- Blue icon (`#2563EB`).
- Blue text (`#2563EB`).
- Rounded corners (`8px`).

### 5.3 Top Navigation Bar
Include:
- Current page title or breadcrumb.
- Search option where useful.
- Notification icon if required.
- User profile menu.
- Logout option.

Keep the top navigation clean and compact.

---

## 6. UI Components

Build reusable components instead of designing every page independently.

### 6.1 Buttons

#### Primary Button
- Background: `#2563EB`
- Text: White (`#FFFFFF`)
- Border radius: `8px`
- Hover: `#1E40AF`

#### Secondary Button
- Background: `#EFF6FF`
- Text: `#2563EB`
- Border: None

#### Outline Button
- Background: White (`#FFFFFF`)
- Text: `#2563EB`
- Border: `1px solid #2563EB`

*All buttons must support hover, focus, disabled, and loading states.*

### 6.2 Cards
Use cards for:
- AQI prediction results.
- Environmental parameters.
- Statistics.
- Charts.
- Recent prediction history.

**Card Styling:**
- Background: White (`#FFFFFF`)
- Border: `1px solid #E2E8F0`
- Border radius: `12px`
- Padding: `20–24px`
- Subtle shadow (`shadow-sm`)
- Consistent spacing

### 6.3 Input Fields
Environmental input fields must include:
- Label
- Input value
- Measurement unit
- Placeholder
- Validation message

**Required Environmental Parameters (8 Total):**
1. **PM2.5** (µg/m³)
2. **PM10** (µg/m³)
3. **NO₂** (µg/m³)
4. **SO₂** (µg/m³)
5. **CO** (mg/m³ or the unit required by the model)
6. **O₃** (µg/m³)
7. **Temperature** (°C)
8. **Humidity** (%)

*Input fields must validate numeric values and acceptable ranges based on the project requirements and training data.*

### 6.4 Tables
Use tables for:
- Prediction history.
- Environmental records.
- Model performance.
- Dataset information.

**Include:**
- Clear column headings.
- Row hover effects.
- Consistent spacing.
- Pagination when required.
- Empty and loading states.

### 6.5 Charts
Use **Recharts** for interactive visualizations.

**Required Chart Types:**
- **Line chart**: AQI trends over time.
- **Bar chart**: Pollutant concentration comparison.
- **Area chart**: Historical AQI patterns.
- **Pie / Donut chart**: AQI category distribution.

**Chart Requirements:**
- Axis labels.
- Legends.
- Tooltips.
- Responsive sizing.
- Appropriate AQI category colors.

*Do not use random or fabricated environmental data in production dashboards.*

---

## 7. Application Pages

### 7.1 Dashboard
Create a professional overview dashboard displaying:
- Latest AQI prediction.
- Current AQI category.
- PM2.5 and PM10 indicators.
- Other environmental parameters.
- Recent prediction history.
- AQI trend chart.
- Pollutant comparison chart.

### 7.2 AQI Prediction Page
Create a dedicated prediction page including:
- Environmental input form with all 8 environmental parameters.
- Input validation with real-time feedback.
- "Predict AQI" action button with loading indicator.
- Prediction result section displaying:
  - Predicted AQI value.
  - AQI category.
  - Health recommendations.
  - Input parameter summary.
  - Prediction timestamp.

*The prediction must come directly from the actual backend ML model.*

### 7.3 Prediction History Page
Display previously generated predictions:
- Prediction date and time.
- AQI value.
- AQI category badge.
- Relevant environmental parameters.
- "View Details" modal/drawer.
- "Download Report" option.

*Records must be retrieved from PostgreSQL.*

### 7.4 Analytics Page
Display historical environmental information through:
- AQI trend charts.
- Pollutant comparison charts.
- AQI category distribution.
- Environmental parameter trends.

*Powered by the actual available dataset and prediction records.*

### 7.5 Reports Page
Allow users to:
- View prediction reports.
- Download reports (e.g. PDF / CSV export).
- Review prediction summaries.

*Use a clean, printable report layout.*

### 7.6 Settings Page
Include:
- User profile information.
- Account settings.
- Password management.
- Application preferences.

---

## 8. AQI Result Design

The AQI result must be one of the most visually prominent elements on the page.

**Display Hierarchy:**
- Large AQI number (`40–48px Bold`).
- Clearly visible category badge (using category color).
- Colored AQI indicator bar / gauge.
- Short, actionable health recommendation.
- Environmental parameter summary card.

> *Never hardcode example AQI values into actual prediction results.*

---

## 9. Icons and Visual Elements

Use **Lucide React** icons:
- `LayoutDashboard` — Dashboard
- `Wind` — Air quality / AQI
- `Activity` — Analytics
- `History` — Prediction history
- `FileText` — Reports
- `Settings` — Settings
- `User` — Profile
- `Download` — Download report
- `RefreshCw` — Refresh data

**Icon Guidelines:**
- Maintain consistent sizing (`18–20px` for navigation, `16px` for inline actions).
- Prefer primary blue icons for navigation highlights.
- Use muted gray for secondary actions.
- Avoid mixing unrelated icon styles.

---

## 10. Spacing and Border Radius System

| Element | Spacing / Dimension |
| :--- | :--- |
| Main Page Padding | `24px` |
| Card Padding | `20–24px` |
| Section Gap | `24px` |
| Component Gap | `12–16px` |
| Input Height | `44–48px` |
| Button Height | `40–44px` |
| Card Radius | `12px` |
| Button Radius | `8px` |
| Input Radius | `8px` |

---

## 11. Interaction and Feedback

Every interactive component must provide immediate, clear feedback:
- Button hover, active, and loading states.
- Client-side and server-side form validation messages.
- Loading spinners / skeleton loaders for asynchronous operations.
- Toast notifications for success and error states.
- Empty states with call-to-actions for empty lists/tables.
- Confirmation modal dialogs for destructive actions.
- Accessible keyboard navigation.

*Do not create buttons that have no functionality.*

---

## 12. Accessibility

Follow core WCAG accessibility practices:
- Maintain sufficient color contrast (minimum 4.5:1 for normal text).
- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`).
- Provide explicit labels and `aria-label`s for all input fields and icon buttons.
- Full keyboard navigability (tab navigation, enter to submit).
- **Do not communicate AQI status using color alone**: Always provide text labels and numerical values.

---

## 13. Frontend Code Organization

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── charts/
│   │   └── forms/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Prediction.jsx
│   │   ├── History.jsx
│   │   ├── Analytics.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 14. Design Quality Requirements

The final application must:
1. Look professional and modern.
2. Follow a consistent white and blue theme.
3. Have a clean dashboard layout.
4. Use reusable components.
5. Be fully responsive across all device sizes.
6. Display real backend prediction results.
7. Show accurate historical data.
8. Provide clear validation and error messages.
9. Avoid unnecessary animations and visual clutter.
10. Maintain consistency across all pages.

---

## 15. Final Design Direction

Create a premium, modern environmental analytics dashboard:
- **Primary background**: White (`#FFFFFF`).
- **Secondary background**: Light blue-gray (`#F8FAFC`).
- **Primary accent**: Blue (`#2563EB`).
- **Typography**: Inter.
- **Components**: Clean cards with subtle borders (`#E2E8F0`).
- **Charts**: Minimal and informative.
- **Navigation**: Simple sidebar and top bar.
- **Overall appearance**: Professional, trustworthy, clean, and data-focused.

*The design should feel like a real environmental monitoring and analytics platform, not a basic college demonstration website.*
