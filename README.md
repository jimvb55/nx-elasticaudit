# Nuxeo Audit Visualization

A dockerized web application for visualizing Nuxeo audit logs stored in Elasticsearch. This application allows users to search for documents by UUID or title, view detailed audit history, and visualize the time spent on each step of the document lifecycle.

## Features

- Search documents by UUID or title
- Interactive timeline visualization showing document lifecycle
- Color-coded event visualization with duration between events
- Detailed audit log tables with filtering and sorting
- Responsive design for desktop and mobile viewing
- Dark/light theme support

## Architecture

The application consists of two main components:

### Backend

- Node.js/Express server
- Proxy for Elasticsearch queries
- RESTful API for audit data
- Data transformation and aggregation

### Frontend

- Vue.js 3 with Composition API
- Vuetify 3 for UI components
- Chart.js for visualizations
- Vue Router for navigation
- Responsive design with CSS Grid and Flexbox

## Prerequisites

- Docker and Docker Compose
- Access to a Nuxeo Elasticsearch index

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nx-elasticaudit.git
   cd nx-elasticaudit
   ```

2. Configure the Elasticsearch connection:
   
   Edit the `docker-compose.yml` file to update the Elasticsearch URL if needed:
   ```yaml
   environment:
     - ELASTICSEARCH_URL=http://10.52.1.17:9200
     - ELASTICSEARCH_INDEX=nuxeo2023-audit
   ```

3. Build and start the containers:
   ```
   docker-compose up -d
   ```

4. Access the application:
   
   Open your browser and navigate to `http://localhost`

## Development Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the development server at `http://localhost:8080`

## Usage

1. **Search for a Document**:
   - Enter a document UUID or title in the search field
   - Select whether you're searching by UUID or title
   - Click "Search" to find the document

2. **View Audit Timeline**:
   - After finding a document, you'll see a timeline visualization
   - The visualization shows each event in the document's lifecycle
   - Hover over segments to see details about each transition
   - Toggle between bar chart and timeline views

3. **Explore Audit Events**:
   - Scroll down to see the full table of audit events
   - Filter events using the search field
   - Sort by any column to analyze patterns

## Docker Deployment

This application is fully dockerized for easy deployment:

1. Make sure Docker and Docker Compose are installed on your server
2. Clone the repository
3. Update the Elasticsearch URL in docker-compose.yml if needed
4. Run `docker-compose up -d`
5. Access the application at http://your-server-ip

## License

[MIT License](LICENSE)

## Credits

Developed for Nuxeo audit log visualization.
