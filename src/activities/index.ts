import axios from 'axios';

export async function greetAsync(name: string): Promise<string> {
  const res = await axios.get(`http://httpbin.org/get?name=${name}`);
  return `Hello ${res.data.args.name} around the internet!`;
}

export function greet(name: string): Promise<string> {
  return Promise.resolve(`Hello ${name} locally!`);
}
