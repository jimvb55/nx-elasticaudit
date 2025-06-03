# Nuxeo Audit Visualization 📊

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Node](https://img.shields.io/badge/node-v16+-yellow.svg)
![Vue](https://img.shields.io/badge/vue-3.x-42b883.svg)

A professional, dockerized web application for visualizing Nuxeo audit logs stored in Elasticsearch. This application provides powerful insights into document lifecycles through beautiful visualizations and detailed audit trails.

![Application Screenshot](https://via.placeholder.com/800x400?text=Nuxeo+Audit+Visualization)

## ✨ Key Benefits

- **Instant Document History**: Quickly retrieve and visualize the complete lifecycle of any document
- **Time Analysis**: Understand how much time documents spend in each lifecycle stage
- **User Activity Tracking**: Identify which users interact with documents and when
- **Performance Insights**: Discover bottlenecks in document processing workflows
- **Compliance Support**: Maintain comprehensive audit trails for regulatory requirements

## 🚀 Features

- **Advanced Search Capabilities**
  - Search documents by UUID or title
  - Instant results with autocomplete suggestions
  - Recently viewed documents history

- **Interactive Visualizations**
  - Timeline charts showing document lifecycle progression
  - Bar charts displaying time spent between events
  - Color-coded event categorization for intuitive understanding
  - Interactive tooltips with detailed event information

- **Comprehensive Audit Information**
  - Detailed document metadata (title, type, path, etc.)
  - Complete event history with timestamps and users
  - Sortable and filterable audit log tables
  - Duration calculations between significant events

- **Professional UI/UX**
  - Responsive design for all devices (desktop, tablet, mobile)
  - Dark/light theme support with automatic detection
  - Accessible interface following WCAG guidelines
  - Smooth animations and transitions

## 🏗️ Architecture

The application follows a modern, scalable architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Vue.js Frontend├────►│  Node.js Backend├────►│  Elasticsearch  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      Vuetify           Express/RESTful API       Nuxeo Audit Index
      Chart.js          Data Transformation        Document Events
      Vue Router        API Proxying               Audit Logs
```

### Backend

- **Node.js/Express server**: Lightweight and performant API server
- **Elasticsearch proxy**: Secure access to Elasticsearch data
- **Data transformation**: Converts raw audit data into visualization-ready formats
- **RESTful API**: Clean endpoints for frontend consumption

### Frontend

- **Vue.js 3**: Modern reactive framework with Composition API
- **Vuetify 3**: Material Design component library for polished UI
- **Chart.js**: Powerful, customizable charts and visualizations
- **Vue Router**: Client-side routing for seamless navigation
- **Responsive design**: Works on all screen sizes and devices

## 📋 Prerequisites

- Docker and Docker Compose
- Access to a Nuxeo Elasticsearch index
- Network connectivity to the Elasticsearch endpoint

## 🔧 Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/nx-elasticaudit.git
   cd nx-elasticaudit
   ```

2. **Configure the Elasticsearch connection**:
   
   Edit the `docker-compose.yml` file to update the Elasticsearch URL:
   ```yaml
   environment:
     - ELASTICSEARCH_URL=http://10.52.1.17:9200
     - ELASTICSEARCH_INDEX=nuxeo2023-audit
   ```

3. **Build and start the containers**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   
   Open your browser and navigate to `http://localhost`

## 💻 Development Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the development server at `http://localhost:8081`

## 📈 Usage

1. **Search for a Document**:
   - Enter a document UUID or title in the search field
   - Select whether you're searching by UUID or title using the dropdown
   - Click "Search" or press Enter to find the document

2. **View Audit Timeline**:
   - The application presents a rich visualization of the document's lifecycle
   - Toggle between different chart types:
     - **Bar Chart**: Shows duration between events as horizontal segments
     - **Timeline**: Displays events as points on a timeline with duration
     - **Debug**: (Development only) Shows chart rendering details

3. **Interact with Visualizations**:
   - Hover over chart elements to see detailed tooltips
   - Click on chart segments to focus on specific events
   - Use the chart legend to filter event types

4. **Explore Audit Events**:
   - Scroll down to see the full table of audit events
   - Use the search field to filter events by any attribute
   - Sort columns to analyze patterns and sequences
   - Paginate through large event sets

## 🐳 Docker Deployment

This application is fully dockerized for easy deployment in any environment:

1. Make sure Docker and Docker Compose are installed on your server
2. Clone the repository to your deployment server
3. Update the Elasticsearch URL in docker-compose.yml if needed
4. Run `docker-compose up -d` to start the application
5. Access the application at http://your-server-ip

For production deployments, consider:
- Setting up a reverse proxy (Nginx, Traefik) for HTTPS
- Implementing authentication if the audit data is sensitive
- Configuring proper logging and monitoring

## ❓ Troubleshooting

**No data appears in visualizations**:
- Verify your Elasticsearch connection in backend/config.js
- Check the browser console for API errors
- Ensure the document UUID exists in the audit index

**Charts not rendering properly**:
- Try switching between chart types
- Use the Debug chart view to see rendering details
- Check your browser console for Chart.js errors

**Performance issues with large audit logs**:
- The backend implements pagination for large datasets
- Consider adjusting the page size in the API calls
- For extremely large audit histories, use more specific date filters

## 📄 License

[MIT License](LICENSE)

## 🙏 Credits

Developed for Nuxeo audit log visualization by the Enterprise Content Management Team.

---

© 2025 Nuxeo Audit Visualization | [Report an Issue](https://github.com/yourusername/nx-elasticaudit/issues)
