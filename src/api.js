const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;

// TODO: URL construction is better with URL search params
export const loadTickers = async (tickers) => {
  const result = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(
      ','
    )}&tsyms=USD&api_key=${API_KEY}`
  );
  const rawData = await result.json();
  const formattedData = Object.fromEntries(
    Object.entries(rawData).map(([key, value]) => [key, value.USD])
  );
  return formattedData;
};
