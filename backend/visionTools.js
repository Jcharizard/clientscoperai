import { PythonShell } from 'python-shell';

export default function visionScore(filename) {
  return new Promise((resolve) => {
    PythonShell.run('vision_score.py', { args: [filename] }, (err, results) => {
      if (err || !results || results.length === 0) {
        return resolve({ active: false, branding: false, type: 'unknown', recommend: 'N/A' });
      }
      try {
        resolve(JSON.parse(results[0]));
      } catch {
        resolve({ active: false, branding: false, type: 'unknown', recommend: 'N/A' });
      }
    });
  });
}
