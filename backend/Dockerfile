FROM mcr.microsoft.com/devcontainers/python:3.11

WORKDIR /workspace

# Install psycopg2 dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc postgresql-client \
 && pip install --upgrade pip

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY app/ ./app/