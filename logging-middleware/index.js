import axios from "axios";

const BASE_URL = "http://20.244.56.144/evaluation-service/logs";
let ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyYXRob3Jlcm9iaW4wM0BnbWFpbC5jb20iLCJleHAiOjE3NTI1NjE4MjQsImlhdCI6MTc1MjU2MDkyNCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImEyOGE1YWFiLTkzN2QtNGI4NS04ZjliLTVjZjZiMDJkMTAzZiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InJvYmluIHJhdGhvcmUiLCJzdWIiOiIyOTUwM2E5Yy03MWRhLTQxNjAtYTU2YS1hYjc4ZGY3MmJlNDUifSwiZW1haWwiOiJyYXRob3Jlcm9iaW4wM0BnbWFpbC5jb20iLCJuYW1lIjoicm9iaW4gcmF0aG9yZSIsInJvbGxObyI6IjIyMTk0NDYiLCJhY2Nlc3NDb2RlIjoiUUFoRFVyIiwiY2xpZW50SUQiOiIyOTUwM2E5Yy03MWRhLTQxNjAtYTU2YS1hYjc4ZGY3MmJlNDUiLCJjbGllbnRTZWNyZXQiOiJyU3JqbkVWQ3FrdXBxdUV5In0.vNwUV9tpW47IQIci_l684wDPXsIuX4f3ud7Rh2IoCJI";

export function setAuthToken(token) {
  ACCESS_TOKEN = token;
}

export async function Log(stack, level, pkg, message) {
  const validStacks = ["backend", "frontend"];
  const validLevels = ["debug", "info", "warn", "error", "fatal"];
  const validPackages = [
    "cache", "controller", "cron job", "db", "domain", "handler",
    "repository", "route", "service", "auth", "config", "middleware",
    "utils", "api", "component", "hook", "page", "state", "style"
  ];

  if (!validStacks.includes(stack)) return;
  if (!validLevels.includes(level)) return;
  if (!validPackages.includes(pkg)) return;

  try {
    await axios.post(
      BASE_URL,
      { stack, level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
  } catch (err) {
    console.error("Failed to log:", err.message);
  }
}
