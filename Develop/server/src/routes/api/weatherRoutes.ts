import { Router, type Request, type Response } from "express";
const router = Router();

// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// TODO: POST Request with cityName name to retrieve weather data
router.post("/", async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  // TODO: save city to search history
  try {
    const { cityName } = req.body;
    console.log(cityName);
    if (!cityName) {
      return res.status(500).json({ error: "cityName name is required" });
    }

    const weatherData = await WeatherService.getWeatherForCity(cityName);
    if (!weatherData) {
      return res.status(500).json({ error: "data couldn't load" });
    }

    await HistoryService.addCity(cityName);
    //console.log(weatherData);
    return res.json(weatherData);
  } catch {
    return res.status(500).json({ error: "Weather data not found " });
  }
});

// TODO: GET search history
router.get("/history", async (_req, res) => {
  try {
    const savedCities = await HistoryService.getCities();
    res.json(savedCities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE cityName from search history
router.delete("/history/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ msg: "City id is required" });
    }
    await HistoryService.removeCity(req.params.id);
    res.json({ success: "City successfully removed from search history" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
