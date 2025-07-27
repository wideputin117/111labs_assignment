import { configDotenv } from "dotenv";
configDotenv();

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;


export const OAUTH_EXCHANGE_EXPIRY =
    15 * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND; // 15 minutes

export const ACCESS_TOKEN_EXPIRY =
    1 *
    HOURS_PER_DAY *
    MINUTES_PER_HOUR *
    SECONDS_PER_MINUTE *
    MILLISECONDS_PER_SECOND; // 1 day

export const REFRESH_TOKEN_EXPIRY =
    15 *
    HOURS_PER_DAY *
    MINUTES_PER_HOUR *
    SECONDS_PER_MINUTE *
    MILLISECONDS_PER_SECOND; // 15 days


export const FRONTEND_URL = process.env.FRONTEND_URL;
