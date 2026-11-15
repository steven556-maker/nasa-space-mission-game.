(() => {
  const ranges = {
    budget: [116, 126],
    massLimit: [60, 76],
    powerNeed: [12, 16],
    fuelLimit: [34, 39],
    commsFactor: [0.92, 1],
    maxDays: [26, 31]
  };

  const plans = {
    orbiter: {
      objectiveId: 'ice', challengeId: 'dark', budget: 122, massLimit: 70,
      powerNeed: 14, fuelLimit: 36, commsFactor: 0.96, maxDays: 29,
      title: 'South-pole orbital survey',
      brief: 'Map a shadowed polar region from orbit, route observations to Earth, and deliver the data to science users.'
    },
    lander: {
      objectiveId: 'landing', challengeId: 'dust', budget: 124, massLimit: 74,
      powerNeed: 15, fuelLimit: 38, commsFactor: 0.98, maxDays: 30,
      title: 'Precision lunar landing',
      brief: 'Survey a safe landing corridor, deliver the payload to the surface, and return useful observations through the ground link.'
    },
    surface: {
      objectiveId: 'seismic', challengeId: 'relay', budget: 126, massLimit: 76,
      powerNeed: 13, fuelLimit: 37, commsFactor: 0.97, maxDays: 30,
      title: 'Lunar surface science',
      brief: 'Deploy a seismic instrument, run surface operations, and return observations through the communications link.'
    }
  };

  const sourceRefs = ['science-missions', 'cml', 'mission-design-lab', 'webb-game', 'cubesat-101', 'mission-viz', 'vr-mission-2023', 'csa-games'];
  const segments = {
    launch: 'Launch vehicle and services place the spacecraft on its mission path.',
    space: 'Spacecraft, trajectory, instrument, power, and operations carry out the science objective.',
    ground: 'Ground communications receive the data and support mission operations.',
    users: 'Science users analyze and apply the returned data.'
  };

  function validate(result, input) {
    if (!result || typeof result !== 'object') throw new Error('Mission scenario must be an object');

    const objectiveIds = new Set((input.objectives || []).map(item => item.id));
    const challengeIds = new Set((input.challenges || []).map(item => item.id));
    if (!objectiveIds.has(result.objectiveId) || !challengeIds.has(result.challengeId)) {
      throw new Error('Mission scenario has an unknown objective or constraint');
    }

    for (const [key, [min, max]] of Object.entries(ranges)) {
      const value = Number(result[key]);
      if (!Number.isFinite(value) || value < min || value > max) throw new Error('Invalid ' + key);
    }

    return {
      objectiveId: result.objectiveId,
      challengeId: result.challengeId,
      budget: Number(result.budget),
      massLimit: Number(result.massLimit),
      powerNeed: Number(result.powerNeed),
      fuelLimit: Number(result.fuelLimit),
      commsFactor: Number(result.commsFactor),
      maxDays: Number(result.maxDays),
      title: String(result.title || 'Lunar mission').slice(0, 90),
      brief: String(result.brief || plans[input.missionType].brief),
      segments,
      sourceRefs: sourceRefs.filter(id => window.NOVA_RESOURCE_CATALOG.sources.some(source => source.id === id)),
      dataStatus: 'SIMPLIFIED'
    };
  }

  function makeMission(input) {
    const plan = plans[input.missionType];
    if (!plan) throw new Error('Choose a lunar mission path first');

    const siteGoal = input.site && input.site.objective;
    const objectiveId = (input.objectives || []).some(item => item.id === siteGoal) ? siteGoal : plan.objectiveId;
    return validate({ ...plan, objectiveId }, input);
  }

  async function generate(input) {
    const local = makeMission(input);
    const provider = window.NOVA_AI_PROVIDER;
    if (typeof provider !== 'function') {
      return { mode: 'LOCAL', scenario: local, message: 'Built from the selected lunar path and the official resource map.' };
    }

    const context = {
      missionType: input.missionType,
      site: input.site && input.site.id,
      objectives: input.objectives,
      constraints: input.challenges,
      challengeUrl: window.NOVA_RESOURCE_CATALOG.challengeUrl,
      resources: window.NOVA_RESOURCE_CATALOG.sources,
      resourceGuidance: window.NOVA_RESOURCE_CATALOG.guardrails,
      segments,
      allowedNumericStatus: 'SIMPLIFIED'
    };

    try {
      const result = await provider({
        task: 'Build one complete playable lunar mission and ground its architecture in the supplied NASA Space Apps resources.',
        context,
        requiredFields: ['title', 'brief', 'objectiveId', 'challengeId', 'budget', 'massLimit', 'powerNeed', 'fuelLimit', 'commsFactor', 'maxDays'],
        rules: [
          'Use the supplied resources for mission structure and design relationships, not for unsupported numeric specifications.',
          'Connect each science goal to a compatible instrument, spacecraft, communications path, and user-facing data product.',
          'Use resource-based review as a checklist of coverage and gaps, not as an official NASA/JPL maturity score.',
          'Keep every numeric game value inside the supplied scenario bands and label it SIMPLIFIED.',
          'Do not present game values as real spacecraft specifications or mission predictions.',
          'Use only the challenge resource list for challenge alignment; optional supplemental sources must be labeled separately.',
          'Return one playable lunar mission, not a list of alternatives.'
        ]
      });
      return { mode: 'AI', scenario: validate(result, input) };
    } catch (err) {
      return { mode: 'LOCAL_FALLBACK', scenario: local, message: 'The supplied mission plan was used after provider output failed validation.' };
    }
  }

  window.NOVA_SCENARIO_GENERATOR = { generate };
})();
