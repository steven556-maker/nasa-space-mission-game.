# NOVA — Space Mission Design Game

**Team NOVA YEARS · NASA Space Apps Challenge 2026**

NOVA is an interactive educational game where players act as Mission Architects. You balance engineering trade-offs, design a spacecraft, and fly the mission in a bundled flight simulator, then get a debrief that explains why the mission succeeded or failed.

<!-- Add 2-3 screenshots or a GIF here, for example:
![Mission design stations](docs/screenshot-stations.png)
![Flight simulator](docs/screenshot-flight.png)
-->

> **Simulation disclaimer:** All budgets, masses, power figures, fuel capacities, bandwidths, risks, durations, and scores are **simplified educational values**. They are not NASA flight specifications or predictions of real missions. NOVA is an independent student project and is not affiliated with or endorsed by NASA, JPL, or CSA; those names are used only to credit sources and inspiration.

---


## How It Works

1. **Pick a mission path:** orbital survey, lander, or surface science.
2. **Design through six stations:** launch service, power, instruments, communications, operations, and trajectory. You can go back and revise any earlier choice, and a decision trail shows what you picked.
3. **Choose science goals:** select up to two objectives. Incompatible instruments are disabled with a short explanation, while power and data demands update live.
4. **Fly it:** the bundled simulator runs your mission in Manual or Autopilot mode and loads the landing site you selected.
5. **Get the debrief:** mid-mission stress events (power, communications, data, time, fuel) feed into a root-cause diagnosis and a flight evaluation report.

## Features

- **Difficulty presets:** Guided, Standard, Tight-Resource, plus a Sandbox mode where failed constraints stay visible but do not block launch.
- **Mission Atlas and 3D scenes:** compare target sites with shared physical references, an interactive 3D planetary/lunar map, and a synchronized 3D trajectory view.
- **Trade-off cards:** see how each choice affects science yield, mass, power, data, cost, trajectory, and time, with short "why" explanations.
- **Mission generator:** "Generate complete mission" builds a deterministic mission for the chosen path and site and checks it against the active constraints.
- **MISSIONFORGE report:** print-ready flight evaluation with local save, JSON export, and share/copy, plus Cost per Science Point (MC/point, inspired by JPL *Marsbound*).
- **Historical lessons:** outcomes are linked to Luna 1, Luna 3, Luna 9, Apollo 15, and Artemis I, and saved runs can be compared.
- **Educational readiness checklist:** benchmarked against NASA mission-design, JPL CML, and CSA learning frameworks.
- **UN SDGs:** relevance to SDG 4 (Quality Education), SDG 9 (Industry, Innovation and Infrastructure), and SDG 12 (Responsible Consumption and Production).

## Alignment with NASA Space Apps Resources

NOVA follows the design lifecycle (Need & Goals → Concept & Requirements → Design → Build & Verify → Implement), the segment architecture (Launch, Space, Ground, User), and the trade-off approach from the [official 2026 challenge resources](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources). `resource-catalog.js` keeps official challenge references separate from supplemental educational sources.

## Balance Testing

Requires [Node.js](https://nodejs.org/).

```bash
node balance-check.js 1000
```

This parses `script.js`, evaluates 1,215 combinations per mission path, computes Pareto fronts, and audits 1,000 scenarios from `scenario-generator.js` so that every in-game scenario has at least one viable solution.

The output also includes a separate `rawConstraintStressTest` over a deliberately broad parameter range. Some of its cases are unwinnable by design; it is a stress test and is not used to generate in-game missions.

Hosts may optionally configure server-side provider hooks for custom scenario generation and diagnosis. Keep all API credentials on the server only.

---

## Attribution

- NASA planetary and lunar imagery, topography, and model sources: [`assets/lunar-mission-simulator/assets/NASA-LUNAR-DATA-SOURCES.txt`](assets/lunar-mission-simulator/assets/NASA-LUNAR-DATA-SOURCES.txt)
- Bundled flight simulator (MIT License): [`assets/lunar-mission-simulator/LICENSE`](assets/lunar-mission-simulator/LICENSE)
- Third-party dependencies and notices: [`assets/lunar-mission-simulator/THIRD_PARTY_NOTICES.md`](assets/lunar-mission-simulator/THIRD_PARTY_NOTICES.md) and [`credits.json`](credits.json)

## Team

**NOVA YEARS:** Steven Osama, Abdelrahman Ahmed, Moataz Hussein, Omar Alaa, Maximos Reda, Shahd Tamer

Copyright © 2026 NOVA YEARS

## Use of Artificial Intelligence

- **Tools used:** ChatGPT and an AI coding assistant.
- **ChatGPT:** brainstorming project ideas, searching for and summarizing sources, and explaining implementation concepts (for example, how function calls and 3D web visualization work) so the team could write the code themselves.
- **AI coding assistant:** final project cleanup, packaging, and drafting this disclosure.
- **Human authorship:** the team chose the challenge, defined the concept and engineering logic, wrote the game code, and tested and verified it. AI output was used as guidance and reviewed by the team.
