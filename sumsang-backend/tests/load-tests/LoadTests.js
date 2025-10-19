import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL } from "../utils/Constants.js";

// Aiming to simulate a higher, more sustained number of users to see how API behaves under stress.
export const options = {
  thresholds: {
    // 99% of requests must complete within 2 seconds.
    http_req_duration: ["p(99) < 2000"],

    // More than 95% of the checks must pass.
    checks: ["rate>0.95"],
  },

    //keeping this low for now to avoid getting blocked by AWS. Will ramp up the values later
  stages: [
    // 1. Ramp-up: Gradually increase from 0 to 100 users over 1 minute.
    { duration: "10s", target: 2 },
    // 2. Sustain Load: Stay at 100 users for 5 minutes.
    { duration: "10s", target: 2 },
    // 3. Ramp-down: Gradually decrease from 100 to 0 users over 1 minute.
    { duration: "5s", target: 0 },
  ],
};

const APIEndpoints = [
  "/internal-api/supply-chain",
  "/internal-api/sales",
  "/internal-api/financial",
  "/internal-api/logistics",
  "/internal-api/production",
  "/public-api/stock",
];

export default function () {
  const requests = APIEndpoints.map((endpoint) => ({
    method: "GET",
    url: `${BASE_URL}${endpoint}`,
  }));

  const responses = http.batch(requests);

  responses.forEach((res, i) => {
    check(res, { [`${APIEndpoints[i]} status was 200`]: (r) => r.status === 200 }),
    check(res, { [`${APIEndpoints[i]} response time < 1s`]: (r) => r.timings.duration < 1000 })
  });

  sleep(Math.random() * 2 + 1);
}
