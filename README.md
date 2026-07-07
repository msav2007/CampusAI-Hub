# CampusAI Hub

> A modern, local-first suite of tools designed for students, developers, and professionals.

CampusAI Hub is a complete web-based tool suite featuring zero-backend utilities. All processing happens entirely within the browser, ensuring maximum privacy, zero latency, and 100% free offline usage.

## 🚀 Features

- **Local-First Architecture:** Files never leave your device. All processing (PDFs, Markdown, parsing) is handled securely in your browser.
- **Modern Tech Stack:** Built with TanStack Start, React 19, Vite, and Tailwind CSS v4.
- **Responsive & Accessible:** Fully optimized for mobile screens with strict adherence to WCAG accessibility guidelines.
- **Light/Dark Mode:** Seamless theme switching with intelligent system preference detection.
- **Performance First:** Aggressive tree-shaking and optimized build sizes for instant load times.

## 🛠️ Tool Suite

### Academic Tools

- **Attendance Calculator:** Track and predict attendance requirements to meet college criteria.
- **CGPA Calculator:** Easily calculate your current and projected CGPA.
- **Grade Predictor:** Estimate the grades needed to reach your target GPA.

### Career & Development Tools

- **Resume Builder:** Professional ATS-friendly resume generation exported natively to PDF.
- **Resume ATS Checker:** Scan your resume against job descriptions for keyword matches and actionable improvements.
- **PDF Studio:** Merge, split, rotate, watermark, and reorder PDF pages locally using `pdf-lib`.
- **Notes Assistant:** Summarize long texts, generate flashcards, and create study questions using local intelligence.
- **README Studio:** Generate professional GitHub READMEs with live previews and automated badge integration.
- **JSON Formatter:** Validate, format, and visualize JSON structures instantly.

## 💻 Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **Local Storage:** Native browser APIs
- **PDF Processing:** `pdf-lib`, `pdfjs-dist`
- **Markdown:** `react-markdown`, `remark-gfm`

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/msav2007/CampusAI-Hub.git
   cd CampusAI-Hub
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📈 Quality Assurance

- **Every Route:** Handled by TanStack Router with type-safe links.
- **Every Button & Input:** Styled consistently using Radix UI primitives and Tailwind.
- **File Upload/Download:** Handled fully via Web APIs (File API, Blob, URL.createObjectURL).
- **TypeScript:** Strict type checking across the entire codebase to prevent runtime errors.
- **Accessibility:** Full keyboard navigation support and ARIA attributes via shadcn/ui components.

## 📝 License

This project is licensed under the MIT License.
