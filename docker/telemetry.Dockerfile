# Production Telemetry Pipeline Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 telemetryuser

COPY telemetry/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY telemetry/ ./telemetry/

RUN chown -R telemetryuser:telemetryuser /app

USER telemetryuser

EXPOSE 8086

HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8086/health')" || exit 1

CMD ["python3", "-m", "telemetry.main"]
