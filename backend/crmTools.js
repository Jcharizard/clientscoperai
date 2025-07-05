import fs from 'fs';

const LEADS_FILE = 'leads.json';

export const saveLead = (lead) => {
  const leads = fs.existsSync(LEADS_FILE) ? JSON.parse(fs.readFileSync(LEADS_FILE)) : [];
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
};

export const exportLeads = () => {
  return JSON.parse(fs.readFileSync(LEADS_FILE));
};
