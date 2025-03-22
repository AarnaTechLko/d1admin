export const getInitialsAfterComma = (positions: string | null | undefined): string => {
  if (!positions) return ''; // Return an empty string if positions is null or undefined

  return positions
    .split(',')
    .map((position) =>
      position
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
    )
    .join(' '); // Join the processed segments with a comma
};

export const formatDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return 'Invalid date';
  }
};

export async function calculateAmount(newCurrency: string, amount: number): Promise<string> {
  try {
    const conversionRate = await getCurrencyInUSD(newCurrency);
    return (conversionRate * amount).toFixed(2);
  } catch (error) {
    console.error('Error calculating amount:', error);
    return 'Error';
  }
}

export function calculateHoursFromNow(dateString: string): number | null {
  try {
    const givenDate = new Date(dateString);
    const currentDate = new Date();

    if (isNaN(givenDate.getTime())) throw new Error("Invalid date format");

    const hoursDifference = (currentDate.getTime() - givenDate.getTime()) / (1000 * 60 * 60);
    return parseFloat(hoursDifference.toFixed(2));
  } catch (error) {
    console.error("Error calculating hours from now:", error);
    return null;
  }
}

export const getCurrencyInUSD = async (currencyCode: string): Promise<number> => {
  const API_URL = 'https://api.currencyfreaks.com/v2.0/rates/latest';
  const API_KEY = '4338ccbbf22a418187de53f2fc38fb48';

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&symbols=USD,${currencyCode}`);

    if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);

    const data: { rates: Record<string, string> } = await response.json();
    const rateToUSD = parseFloat(data.rates['USD']);
    const rateFromCurrency = parseFloat(data.rates[currencyCode]);

    if (!rateFromCurrency || !rateToUSD) throw new Error('Invalid currency rate data');

    return rateToUSD / rateFromCurrency;
  } catch (error) {
    console.error('Error fetching currency rates:', (error instanceof Error ? error.message : error));
    throw new Error('Failed to fetch currency rate');
  }
};

export function getRemainingTime(createdAt: string, turnaroundTime: number): number {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();

  const turnaroundTimeInMs = turnaroundTime * 60 * 60 * 1000;
  const remainingTimeInMs = createdDate.getTime() + turnaroundTimeInMs - currentDate.getTime();

  return Number((remainingTimeInMs / (1000 * 60 * 60)).toFixed(2));
}

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Invalid amount";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
};
