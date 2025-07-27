import { configDotenv } from "dotenv";
configDotenv();

 

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;

 
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
