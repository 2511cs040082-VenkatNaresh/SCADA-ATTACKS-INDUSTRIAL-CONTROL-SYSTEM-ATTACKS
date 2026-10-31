FROM python:3.11-slim

WORKDIR /app

COPY simulator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY simulator ./ics-lab/simulator

EXPOSE 8085

CMD ["python", "-m", "ics-lab.simulator.main"]
