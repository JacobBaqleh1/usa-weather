import dotenv from "dotenv";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lon: number;
  lat: number;
}
// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  date: number;
  icon: string;
  description: string;
  temp: number;
  windSpeed: number;
  humidity: number;

  constructor(
    cityName: string,
    date: number,
    icon: string,
    description: string,
    temp: number,
    windSpeed: number,
    humidity: number
  ) {
    this.cityName = cityName;
    this.date = date;
    this.icon = icon;
    this.description = description;
    this.temp = temp;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private APIKey?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "https://api.openweathermap.org";
    this.APIKey = process.env.API_KEY || "";
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(city: string) {
    try {
      const query = this.buildGeocodeQuery(city);
      const response = await fetch(query);

      const locationData = await response.json();
      console.log(locationData);
      return locationData;
    } catch (err) {
      console.log("error fetching location", err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData;
    console.log({ lat, lon });
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${city}&appid=${this.APIKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    console.log(lat, lon);
    return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.APIKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string) {
    try {
      const locationDataArray = await this.fetchLocationData(city);

      console.log(locationDataArray);

      if (!locationDataArray || locationDataArray.length === 0) {
        throw new Error("no location found");
      }

      const locationData = locationDataArray[0];

      return this.destructureLocationData(locationData);
    } catch (err) {
      console.log("error fetching a destructing location", err);
      return null;
    }
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error("error fetching weather data");
    }
    const weatherData = await response.json();

    if (!weatherData || !weatherData.city) {
      throw new Error('invalid, "city" is missing');
    }

    return weatherData;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    if (!response || !response.city) {
      throw new Error('invalid response, "city" is missing');
    }

    const cityName = response.city.name;
    const date = response.list[0].dt;
    const icon = response.list[0].weather[0].icon;
    const description = response.list[0].weather[0].description;
    const temp = response.list[0].main.temp;
    const windSpeed = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    return new Weather(
      cityName,
      date,
      icon,
      description,
      temp,
      windSpeed,
      humidity
    );
  }
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
  //   const forecastArray: Weather[] = [];

  //   for (const day of weatherData) {
  //     if (day.dt !== currentWeather.date) {
  //       const cityName = currentWeather.cityName;
  //       const date = day.dt;
  //       const icon = day.weather[0].icon;
  //       const description = day.weather[0].description;
  //       const temp = day.main.temp;
  //       const windSpeed = day.wind.speed;
  //       const humidity = day.main.humidity;

  //       const forecastWeather = new Weather(
  //         cityName,
  //         date,
  //         icon,
  //         description,
  //         temp,
  //         windSpeed,
  //         humidity
  //       );

  //       forecastArray.push(forecastWeather);
  //     }
  //   }
  //   return forecastArray;
  // }
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray: Weather[] = [];
    let highestTemp = null; // To store the highest temperature for the current day
    let currentDay = 0; // To keep track of the current day

    for (const day of weatherData) {
      // If we are on a new day
      if (currentDay !== day) {
        // If we have a previous day's highest temperature, push it to the array
        if (currentDay) {
          forecastArray.push(
            new Weather(
              currentWeather.cityName,
              currentWeather.date, // Previous day's date
              day.weather[0].icon, // Icon from the last entry of the previous day
              day.weather[0].description, // Description from the last entry of the previous day
              highestTemp, // Highest temperature recorded for the previous day
              day.wind.speed, // Last wind speed (optional)
              day.main.humidity // Last humidity (optional)
            )
          );
        }

        // Update currentDay and reset highestTemp for the new day
        currentDay = day;
        highestTemp = day.main.temp; // Start with the current day's temperature
      } else {
        // Update highestTemp if the current temperature is higher
        if (day.main.temp > highestTemp) {
          highestTemp = day.main.temp; // Update to the higher temperature
        }
      }
    }

    // After the loop, push the last day's data if it exists
    if (currentDay) {
      forecastArray.push(
        new Weather(
          currentWeather.cityName,
          currentDay,
          weatherData[weatherData.length - 1].weather[0].icon, // Use the last icon
          weatherData[weatherData.length - 1].weather[0].description, // Use the last description
          highestTemp,
          weatherData[weatherData.length - 1].wind.speed, // Use the last wind speed
          weatherData[weatherData.length - 1].main.humidity // Use the last humidity
        )
      );
    }

    return forecastArray.slice(0, 5); // Return only the first 5 days
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);

      if (!coordinates) {
        throw new Error("No valid coordinates found");
      }

      const weatherData = await this.fetchWeatherData(coordinates);

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(
        currentWeather,
        weatherData.list
      );

      return [currentWeather, forecast];
    } catch (err) {
      console.error("error getting weather", err);
      return null;
    }
  }
}

export default new WeatherService();
