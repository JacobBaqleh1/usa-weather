import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}
// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile("db/db.json", {
      flag: "a+",
      encoding: "utf8",
    });
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile("db/db.json", JSON.stringify(cities, null, "\t"));
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let parsedCities: City[];

      try {
        parsedCities = [].concat(JSON.parse(cities));
      } catch (err) {
        parsedCities = [];
      }
      return parsedCities;
    });
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    if (!city) {
      throw new Error("City cannot be blank");
    }
    const newCity: City = {
      id: uuidv4(),
      name: city,
    };
    return await this.getCities()
      .then((cities) => {
        return [...cities, newCity];
      })
      .then((updatedCities) => this.write(updatedCities))
      .then(() => newCity);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    //read cities
    let parsedCities = this.getCities();
    //filter out the given city
    const filteredCities = (await parsedCities).filter((city: City) => {
      city.id !== id;
    });

    if ((await parsedCities).length === filteredCities.length) {
      return { success: false, message: "no match found" };
    }

    await fs.writeFile("db/db.json", JSON.stringify(filteredCities, null, 2));
    return { success: true, message: "City deleted" };
  }
}

export default new HistoryService();
