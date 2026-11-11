import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  process.stdout.write(`[INIT] Tele-nutrition API service listening on port ${port} (PID: ${process.pid})\n`);
});
