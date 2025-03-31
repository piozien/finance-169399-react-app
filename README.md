# Finance Frontend

React application for managing personal finances. This is the frontend part of the Finance Dashboard application.

## Development

### Prerequisites
- Node.js (Latest LTS version)
- npm or yarn

### Running locally
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with necessary environment variables (see below)

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for production
```bash
npm run build
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
- `VITE_API_URL`: Backend API URL

## Tech Stack
- React 19
- Vite 6
- React Router DOM 7
- Recharts for data visualization
- Axios for API requests

## Project Structure
- `/src` - Source code
- `/public` - Static assets
- `/src/components` - React components
- `/src/pages` - Page components
- `/src/api` - API integration

## Related Projects
- [Finance Dashboard](https://github.com/piozien/finance-169399-spring-boot) - Backend Spring Boot application
