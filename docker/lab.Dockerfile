# Isolated ICS Laboratory Simulator Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 labuser

COPY ics-lab/simulator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ics-lab/simulator ./ics-lab/simulator

RUN chown -R labuser:labuser /app

USER labuser

EXPOSE 8085

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8085/health')" || exit 1

CMD ["python3", "-m", "ics-lab.simulator.main"]
