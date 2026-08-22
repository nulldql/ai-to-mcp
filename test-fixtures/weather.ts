export type WeatherReport = {
  temp: number;
  condition: string;
};

/**
 * gets the current weather for a city
 */
export function getWeather(city: string, units?: "metric" | "imperial"): WeatherReport {
  return { temp: units === "imperial" ? 72 : 22, condition: `sunny in ${city}` };
}

/**
 * adds two numbers together
 */
export function add(a: number, b: number): number {
  return a + b;
}
