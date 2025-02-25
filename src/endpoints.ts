const ENDPOINTS = {
  xrif: "/api/xrif",
};

export const fetchXRIF = (message: string) => {
  const url = new URL(ENDPOINTS.xrif, location.href);
  // Create a promise that fetches the API and parses the JSON.
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({ message }),
  }).then((res) => res.json());
  // TODO: Handle errors.
};
