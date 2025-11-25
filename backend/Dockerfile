# Base Image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
# Crucial for ReportLab, PyCairo, and Pillow
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    pkg-config \
    libcairo2-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "p2p_system.wsgi:application", "--bind", "0.0.0.0:8000"]