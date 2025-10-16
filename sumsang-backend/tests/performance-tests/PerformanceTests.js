import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  thresholds: {
    // Assert that 99% of requests finish within 300ms.
    http_req_duration: ["p(99) < 300"],

    // require at least 59% of checks to pass
    checks: ["rate>0.95"], 
  },
  // Ramp the number of virtual users up and down
  stages: [
    { duration: "10s", target: 15 },
    { duration: "10s", target: 15 },
    { duration: "10s", target: 0 },
  ],
};

const BASE_URL = "https://bbd-grad-project.co.za";

const internalAPIEndpoints = [
  "/supply-chain",
  "/sales",
  "/financial",
  "/logistics",
  "/production",
];

export default function () {
  const requests = internalAPIEndpoints.map((e) => [`GET`, `${BASE_URL}/internal-api${e}`]);
  const responses = http.batch(requests);

  responses.forEach((res, i) => {
    check(res, { [`${internalAPIEndpoints[i]} status was 200`]: (r) => r.status === 200 });
  });

  sleep(1);
}