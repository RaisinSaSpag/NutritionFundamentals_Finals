import './config/env';
import app from './app';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  process.stdout.write(`[INIT] Tele-nutrition API service listening on port ${port} (PID: ${process.pid})\n`);
});