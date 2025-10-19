# Kentucky Baked Pizza 🍕

A full-featured web application for pizza ordering, built with modern technology stack.

## 🏗️ Architecture

This project is a monorepo containing two main applications:

- **Backend** - NestJS API server with TypeScript
- **Frontend** - React application with Vite and TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install all dependencies for backend and frontend
pnpm install
```

### Development Mode

```bash
# Run both backend and frontend simultaneously
pnpm dev
```

This script will start:
- Backend API at http://localhost:3000
- Frontend application at http://localhost:5173

### Other Useful Commands

```bash
# Build all applications
pnpm build

# Run in production mode
pnpm start

# Run tests
pnpm test

# Lint code
pnpm lint

# Clean build files
pnpm clean
```

## 📁 Project Structure

```
kentucky-baked-pizza/
├── backend/                 # NestJS API server
│   ├── src/                # Source code
│   ├── test/               # Tests
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── src/                # Source code
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md              # This file
```

## 🛠️ Technologies

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed JavaScript
- **Jest** - Testing framework

### Frontend
- **React** - Library for building user interfaces
- **Vite** - Fast build tool
- **TypeScript** - Typed JavaScript
- **CSS3** - Styling

## 🔧 Development

### Running Individual Applications

```bash
# Backend only
pnpm --filter backend dev

# Frontend only
pnpm --filter frontend dev
```

### Adding Dependencies

```bash
# Add dependency to backend
pnpm --filter backend add <package-name>

# Add dependency to frontend
pnpm --filter frontend add <package-name>

# Add dev dependency to root
pnpm add -D <package-name>
```

## 📝 License

This project is created for demonstration purposes.
