# Use a specific Python version that's compatible with your dependencies
FROM python:3.11-slim-bookworm

# Install Rust and build tools (needed for pydantic-core)
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    make \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && /root/.cargo/bin/rustc --version \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Cargo
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY backend/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
