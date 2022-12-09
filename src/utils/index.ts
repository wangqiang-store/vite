export let localWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
};

export let localRead = (key: string) => {
  let value: string | null = localStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};

export let sessionWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(key, value);
};

export let sessionRead = (key: string) => {
  let value: string | null = sessionStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};

export let deepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};
