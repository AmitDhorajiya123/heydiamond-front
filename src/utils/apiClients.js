const STORAGE_KEY = 'hd_api_clients';

const DEFAULT_API_CLIENTS = [
    { id: 'noamdiamonds', name: 'NoMDiamonds', url: 'https://noamdiamonds.com/apis/api/getStockN?auth_key=h3hqs2oimfnl' },
    { id: 'shivkrishnadiamond', name: 'ShivKrisnaDiamond', url: 'https://shivkrishnadiamond.com/papi/get_stock' },
];

export const getApiClients = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && parsed.length) {
            return parsed;
        }
    } catch (error) {
        /* ignore storage failures */
    }
    return DEFAULT_API_CLIENTS;
};

export const saveApiClients = (clients) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (error) {
        /* ignore storage failures */
    }
};
