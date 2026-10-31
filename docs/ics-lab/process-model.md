# Physical Process Model & Controls

## Process Description: Water Treatment & Storage Loop
The physical simulation within the ICS-SHIELD Laboratory models an automated **Industrial Water Treatment & Storage System**. 

The process loop models liquid dynamics, thermal exchange, pump mechanics, valve regulation, and water quality metrics.

```
       +------------------------------------------------------+
       |                  Raw Water Supply                    |
       +------------------------------------------------------+
                                  |
                                  v  [Inlet Control Valve ACT-VALVE01]
                       +----------------------+
                       |     Storage Tank     |  <--- Level Sensor SENSOR-L01
                       |   (0 - 100% Vol)     |  <--- Temp Sensor SENSOR-T01
                       +----------------------+
                                  |
                                  v  [Feed Water Pump ACT-PUMP01]
                       +----------------------+
                       |    Discharge Loop    |  <--- Pressure Sensor SENSOR-P01
                       +----------------------+
                                  |
                                  v
                       +----------------------+
                       |  Outflow Distribution|
                       +----------------------+
```

## Differential Physics Equations

### 1. Liquid Tank Level ($L$)
The rate of change of the tank level percentage over time $t$:
$$\frac{dL}{dt} = \frac{1}{V_{\text{max}}} \cdot \left( F_{\text{in}} \cdot v_{\text{pos}} - F_{\text{out}} \cdot \sqrt{\frac{N_{\text{pump}}}{N_{\text{max}}}} \right) + \eta_L$$
Where:
- $V_{\text{max}} = 1000\text{ Liters}$ (Maximum tank capacity)
- $v_{\text{pos}} \in [0, 1]$ (Normalized valve open ratio)
- $N_{\text{pump}} \in [0, 3000]\text{ RPM}$ (Feed pump speed)
- $\eta_L \sim \mathcal{N}(0, 0.05)$ (Gaussian sensor measurement noise)

### 2. System Pressure ($P$)
The hydraulic header pressure:
$$P = P_{\text{base}} + k_p \cdot \left(\frac{N_{\text{pump}}}{N_{\text{max}}}\right)^2 - k_v \cdot v_{\text{pos}} + \eta_P$$
Where $P_{\text{base}} = 1.0\text{ bar}$, $k_p = 4.0\text{ bar}$, $k_v = 0.5\text{ bar}$.

### 3. Temperature Exchange ($T$)
$$\frac{dT}{dt} = \frac{F_{\text{in}}}{V_{\text{tank}}} (T_{\text{ambient}} - T) + \frac{Q_{\text{pump}}}{C_p} + \eta_T$$

## Safety Thresholds & Alarm Boundaries

| Variable | Min Safe | Max Safe | Min Critical | Max Critical | Unit | Action on Critical |
|---|---|---|---|---|---|---|
| Tank Level | $20.0\%$ | $80.0\%$ | $10.0\%$ | $90.0\%$ | $\%$ | Trip Emergency Drain Valve |
| Pressure | $1.5\text{ bar}$ | $7.0\text{ bar}$ | $0.5\text{ bar}$ | $9.0\text{ bar}$ | $\text{bar}$ | Shut Down Feed Pump |
| Temperature | $15.0^\circ\text{C}$ | $45.0^\circ\text{C}$ | $5.0^\circ\text{C}$ | $60.0^\circ\text{C}$ | $^\circ\text{C}$ | Enable Cooling Loop |
| Flow Rate | $20.0\text{ L/min}$ | $220.0\text{ L/min}$ | $0.0\text{ L/min}$ | $280.0\text{ L/min}$ | $\text{L/min}$ | Trigger Alarm |

## PLC Closed-Loop Control Logic
Primary PLC (`PLC-001`) runs a closed-loop controller every 1000ms scan cycle:
- If `tank_level < target_setpoint - hysteresis`: Open valve `ACT-VALVE01` to $80\%$, ramp pump `ACT-PUMP01` to $1800\text{ RPM}$.
- If `tank_level > target_setpoint + hysteresis`: Close valve `ACT-VALVE01` to $20\%$, throttle pump `ACT-PUMP01` to $800\text{ RPM}$.
- In case of critical pressure overflow ($P > 9.0\text{ bar}$): Force pump shutoff (`N_pump = 0`).
