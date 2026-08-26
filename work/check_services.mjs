import { fetchAvailableLaundryServices } from '../backend/src/controllers/service.controller.js';

try {
  const services = await fetchAvailableLaundryServices();
  console.log(JSON.stringify({ success: true, count: services.length }));
} catch (error) {
  console.error(JSON.stringify({ success: false, message: error.message }));
  process.exitCode = 1;
}
