export function custom(options = {}) {
  const { name = 'custom', generate } = options;

  if (typeof generate !== 'function') {
    throw new Error(
      '[just-in-vibes] Custom provider requires a generate(prompt) function'
    );
  }

  return {
    name,
    async generate(prompt) {
      const result = await generate(prompt);
      if (typeof result !== 'string') {
        throw new Error('[just-in-vibes] Custom provider generate() must return a string of HTML');
      }
      return result;
    },
  };
}
