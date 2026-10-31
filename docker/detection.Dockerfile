# Production Detection Engine Dockerfile (FastAPI + ML Anomaly Pipeline)
FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 detectionuser

COPY detection-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY detection-engine/ ./

RUN chown -R detectionuser:detectionuser /app

USER detectionuser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')" || exit 1

CMD ["python3", "main.py"]
