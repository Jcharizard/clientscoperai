import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function aiTools(bio = '', screenshotPath = '') {
  return new Promise((resolve, reject) => {
    const script = screenshotPath ? 'vision_score.py' : 'bio_score.py';
    const input = screenshotPath || bio;

    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: __dirname,
      args: [input]
    };

    PythonShell.run(script, options, (err, results) => {
      if (err || !results) return reject(err);
      try {
        const parsed = JSON.parse(results[0]);
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  });
}
