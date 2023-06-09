const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;

// TODO: Construct URL is better with URL search params
export const loadTicker = async (tickers) => {
  const result = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
      ','
    )}&api_key=${API_KEY}`
  );
  const data = await result.json();
  return data;
};
