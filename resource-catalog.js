window.NOVA_RESOURCE_CATALOG = {
    challengeUrl: 'https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources',
    sources: [
      {id:'science-missions',title:'Design and Develop Science Missions',url:'https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf',scope:'Four mission segments (Launch, Space, Ground, User) and the overview sequence: identify need/goals, define concept and requirements, design, build and verify, then implement.'},
      {id:'lro-moon-model',title:'NASA LRO Moon 3D model',url:'https://svs.gsfc.nasa.gov/14959/',scope:'NASA Goddard web-ready lunar model made with Lunar Reconnaissance Orbiter imagery and topographic data; used for the NOVA interactive Moon globe.'},
      {id:'cml',title:'JPL Concept Maturity Levels (CMLs)',url:'https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299',scope:'Assess concept completeness and remaining work across science, technical, management, cost, and other dimensions. Early feasibility, trade-space, and point-design work is iterative; NOVA uses an educational checklist, not a formal CML rating.'},
      {id:'mission-design-lab',title:'NASA Mission Design Lab',url:'https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/',scope:'Integrated mission trade studies across orbit, spacecraft, instruments, launch, communications, ground systems, operations, mass, power, data rate, risk, and cost. NOVA adapts the systems view for a simplified game.'},
      {id:'mission-viz',title:'NASA Mission Viz',url:'https://nasa.github.io/mission-viz/',scope:'Visual communication of spacecraft, celestial bodies, and mission trajectories.'},
      {id:'webb-game',title:'NASA Webb: Build It Yourself',url:'https://science.nasa.gov/mission/webb/game-build-it-yourself/',scope:'Science goals drive instrument choices; unavailable choices can be constrained by science or technology fit, and players can revise choices before launch. NOVA adapts these learning patterns for lunar missions.'},
      {id:'cubesat-101',title:'NASA CubeSat 101',url:'https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf',scope:'Beginner guide covering concept development, feasibility review, ground-station and hardware testing, readiness reviews, launch, and mission operations. NOVA borrows the lifecycle and verification-learning pattern, not CubeSat-specific requirements.'},
      {id:'vr-mission-2023',title:'Space Apps 2023: Visualize a Space Mission Using Virtual Reality',url:'https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/',scope:'The challenge calls for an interactive 3D/VR visualization of a mission concept, trajectory, and timeline. NOVA maps those goals to a browser-based lunar concept, Earth–Moon route, and phase-synchronized 3D view; it does not claim headset VR or navigation-grade trajectories.'},
      {id:'marsbound',title:'JPL Marsbound! Mission to the Red Planet',url:'https://www.jpl.nasa.gov/edu/resources/lesson-plan/marsbound-mission-to-the-red-planet/',scope:'Supplemental teaching pattern: objective prioritization and budget/mass/power trade-offs; cost per science star as an efficiency comparison. Not a 2026 challenge resource.'},
      {id:'lunar-history',title:'NASA lunar exploration history',url:'https://science.nasa.gov/solar-system/moon/history-of-lunar-exploration/',scope:'Historical lessons from robotic missions through Apollo; cited independently from current mission specifications.'},
      {id:'csa-games',title:'CSA Digital Games and Activities',url:'https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp',scope:'Educational activity examples use clear missions, short interactive tasks, and real-world users or science goals. NOVA draws on this as a learning-design reference.'}
    ],
    labels: {
      REAL: 'Directly stated or measured in a linked source.',
      DERIVED: 'Calculated from cited source inputs with a named method; NOVA currently has no externally validated derived mission values.',
      SIMPLIFIED: 'Educational game-balancing value. Not a NASA specification or mission prediction.'
    },
    guardrails: [
      'All current NOVA budget, mass, power, fuel, bandwidth, risk, and score figures are SIMPLIFIED.',
      'Use the challenge resource descriptions to model relationships, not as evidence for numeric spacecraft specifications.',
      'Do not label game values as derived from real mission data unless the source inputs and calculation method are shown.',
      'Keep Launch, Space, Ground, and User segments visible in the mission design and debrief.',
      'Use only challenge-listed resources as the basis for challenge alignment; clearly label any supplemental learning reference.'
    ]
};
