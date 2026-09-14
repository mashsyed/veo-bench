# Stage 1: Build React Frontend SPA
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Serving
FROM python:3.11-slim
WORKDIR /app

# Install system libraries required by OpenCV (libgl1, libglib2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Application Code
COPY backend /app/backend

# Copy Built Frontend SPA Assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set working directory to backend so app module imports work
WORKDIR /app/backend

ENV PYTHONPATH=/app/backend
ENV PORT=8080

EXPOSE 8080

# Run FastAPI backend server on Cloud Run PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
