function buildPrompt({ address, apiData } = {}) {
    
  const Prompt = `You are a assistant.`;

  const final = `${Prompt}\n\nData from Chicago city api: ${apiData}\n\nUser address: ${address}`;

  return final;
}

module.exports = {
  buildPrompt
};
