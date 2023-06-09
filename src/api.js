const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;

const tickersHandlers = new Map();

// TODO: URL construction is better with URL search params
const loadTickers = async () => {
  if (tickersHandlers.size === 0) return;

  const result = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Array.from(
      tickersHandlers.keys()
    ).join(',')}&tsyms=USD&api_key=${API_KEY}`
  );
  const rawData = await result.json();
  const formattedData = Object.fromEntries(
    Object.entries(rawData).map(([key, value]) => [key, value.USD])
  );

  Object.entries(formattedData).forEach(([currency, newPrice]) => {
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach((fn) => fn(newPrice));
  });
  return formattedData;
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(
    ticker,
    subscribers.filter((fn) => fn !== cb)
  );
};

setInterval(() => {
  loadTickers();
}, 3000);

window.tickersHandlers = tickersHandlers;
