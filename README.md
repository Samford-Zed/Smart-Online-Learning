# Smart Online Learning System


Welcome to the SOLS project repository! This project is structured as a **Monorepo**, meaning both our Frontend and Backend applications, along with shared configurations and documentation, all live together in this single repository.

## 🚀 Getting Started

### Prerequisites
- Node.js
- PostgreSQL (Neon recommended)
- `npm` or `yarn`

### Installation
1. Clone the repository.
2. Install dependencies in the root and in `apps/api`:
   ```bash
   npm install
   cd apps/api
   npm install
   ```
3. Set up your `.env` file in `apps/api` (see `.env.example`).

### Database Setup
To initialize the database and seed it with Phase 1 test data:
```bash
cd apps/api
npm run seed
```

### Running the API
```bash
npm run dev
```

## 🛠 Phase 1 Implementation (MVP)
The following modules have been implemented for the Student API:
- **Courses**: Managed via slugs, grouped by modules.
- **Dashboard**: Progress overview, current courses, and upcoming tasks.
- **Lesson Player**: Unified video/PDF player with completion tracking.
- **Assignments**: Enhanced submission workflow with file uploads.
- **Grades**: GPA and subject-wise grade tracking.

For detailed API examples, see [api_documentation.md](file:///c:/Users/HP/.gemini/antigravity/brain/8b68249a-d361-466b-b097-ec2e97bdbb99/artifacts/api_documentation.md).

## 📂 Repository Architecture Overview

Here is where you need to go depending on your role in the team:

### 🎨 Frontend Team (`apps/web/`)
All user interface code, React components, state management, and API integrations are located in the `apps/web` directory.

We use a **Feature-Sliced Design**. This means instead of hunting for all components in one place and all hooks in another, you will work primarily inside the specific feature domain you are assigned to.

**Where to work:**
- **`apps/web/src/features/`**: **Work Here!** This is where domain-specific logic lives (e.g., `auth`, `student`, `teacher`, `courses`). Each feature should encapsulate its own components, hooks, and localized state.
- **`apps/web/src/components/ui/`**: For generic, reusable "dumb" components (Buttons, Inputs, Modals).
- **`apps/web/src/app/` & `pages/`**: Only for defining routes and page layouts.
- **`apps/web/src/services/`**: For API abstractions and fetching logic.
- **`apps/web/src/i18n/`**: For Amharic (`am`), Afaan Oromoo (`om`), and English translations.

### ⚙️ Backend Team (`apps/api/`)
All server logic, database operations, APIs, and business rules are located in the `apps/api` directory.

Our Node.js API follows a **Modular Domain-Driven Design**, perfectly mirroring the Frontend features to make full-stack collaboration seamless.

**Where to work:**
- **`apps/api/src/modules/`**: **Work Here!** This is where you will build out endpoints, services, and business logic for specific domains (e.g., `users`, `courses`, `quizzes`).
- **`apps/api/src/db/`**: For all database schema definitions, migrations, and seed scripts.
- **`apps/api/src/middlewares/`**: For adding authentication guards, role-based access control, and error handling.
- **`apps/api/src/config/`**: For environment variables and logging setups.

### 🤝 Full-Stack & Shared Resources (`packages/`)
To prevent duplicating code across the frontend and backend, we use the `packages/` directory for code sharing.
- **`packages/shared-types/`**: **Crucial!** If you create a new database model or API payload, define the TypeScript interface here. Both the Frontend and Backend import from here to guarantee type safety across the network.
- **`packages/eslint-config/` & `tsconfig/`**: Shared linting and compilation rules to ensure code looks identical whether you are writing React or Node.

### 📚 Documentation (`docs/`)
- **`docs/api/`**: API specifications and Postman/Swagger collections.
- **`docs/architecture/`**: High-level design decisions.
- **`docs/srs/`**: Software Requirements Specifications.

## 🚀 General Workflow Rules
1. **Never mutate shared types blindly**: If you change `packages/shared-types`, ensure both `apps/web` and `apps/api` compile successfully.
2. **Feature Encapsulation**: If a component or function is only used for the "Quizzes" system, put it in the `quizzes` feature/module, NOT in the global shared folders. Only promote code to global shared folders if it is utilized by multiple domains.
3. **Keep `apps/web/src/pages` clean**: Pages should merely be wrappers that import complex views from the `features/` directory.

---
*Happy Coding!*
