export type Car = {
  id: string;
  name: string;
  year: number;
  colour: string;
  body: string;
  price: string;
  detail: string;
  images: string[];
};

const photos = (id: string, n: number) => Array.from({ length: n }, (_, i) => `/cars/${id}-${i + 1}.jpg`);

// TODO: prices and details are placeholders — swap for real stock data (or fetch from a CMS / DMS feed).
export const cars: Car[] = [
  { id: "audi-a4", name: "Audi A4", year: 2019, colour: "Black", body: "Saloon", price: "£15,995", detail: "Manual · Cloth interior · Tri-zone climate", images: photos("audi-a4", 7) },
  { id: "merc-cla", name: "Mercedes CLA", year: 2017, colour: "White", body: "Coupé", price: "£13,495", detail: "AMG Line · Automatic · Sport seats", images: photos("merc-cla", 7) },
  { id: "jeep-compass", name: "Jeep Compass", year: 2022, colour: "Slate blue", body: "SUV", price: "£18,995", detail: "Black alloys · Roof rails", images: photos("jeep-compass", 3) },
  { id: "audi-a3", name: "Audi A3", year: 2017, colour: "Blue", body: "Saloon", price: "£9,995", detail: "149,026 miles · Automatic", images: photos("audi-a3", 8) },
  { id: "seat-ibiza", name: "SEAT Ibiza", year: 2013, colour: "White", body: "Hatchback", price: "£4,995", detail: "FR · Manual", images: photos("seat-ibiza", 3) },
  { id: "honda-civic", name: "Honda Civic", year: 2012, colour: "Silver", body: "Hatchback", price: "£4,495", detail: "Manual", images: photos("honda-civic", 1) },
];

export const carMeta = (c: Car) => `${c.year} · ${c.colour} · ${c.body}`;
