// @ts-expect-error Bun handles asset import
import imagepath from "./E7.png";

const E7_WAYPOINTS: [string, number, number][] = [
  ["A", 1339, 906],
  ["B", 2065, 1008],
  ["C", 1965, 1132],
  ["D", 1935, 1006],
  ["E", 1817, 1334],
  ["F", 1709, 778],
  ["G", 1443, 572],
  ["H", 951, 616],
  ["I", 827, 610],
  ["J", 1865, 434],
  ["K", 1535, 1535],
  ["L", 1425, 1229],
  ["M", 739, 1225],
  ["N", 2243, 1083],
  ["O", 1611, 413],
  ["P", 2227, 1169],
  ["Q", 2091, 1157],
  ["R", 2071, 1247],
  ["S", 2005, 1277],
  ["T", 2069, 1199],
];

export const LEGEND_MAP = new Map([
  ["A", "RoboHub"],
  ["B", "Ideas Clinic"],
  ["C", "C&D - Main Entrance"],
  ["D", "Novelties"],
  ["E", "Microwaves"],
  ["F", "Elevators"],
  ["G", "Silent Study"],
  ["H", "Shower A"],
  ["I", "Shower B"],
  ["J", "Assembly Room"],
  ["K", "E5 Entrance"],
  ["L", "Temporary Booth"],
  ["M", "North Entrance"],
  ["N", "South Entrance"],
  ["O", "East Entrance"],
  ["P", "C&D - Coffee Area"],
  ["Q", "C&D - Hot Food Area"],
  ["R", "C&D - Snack Area"],
  ["S", "C&D - Cold Drink Area"],
  ["T", "C&D - Pastry Area"],
]);

export const ROBOT_START = {
  x: 50,
  y: 40,
};

const IMAGE_X = 3400;
const IMAGE_Y = 2200;

const CROP_LEFT = 440;
const CROP_TOP = 270;

const CROP_RIGHT = IMAGE_X - 2800;
const CROP_BOTTOM = IMAGE_Y - 1700;

export const IMAGE_START_X = CROP_LEFT;
export const IMAGE_START_Y = CROP_TOP;
export const IMAGE_CROPPED_X = IMAGE_X - CROP_LEFT - CROP_RIGHT;
export const IMAGE_CROPPED_Y = IMAGE_Y - CROP_TOP - CROP_BOTTOM;

const SCALE = 20;

export const GRID_X = Math.round(IMAGE_CROPPED_X / SCALE);
export const GRID_Y = Math.round(IMAGE_CROPPED_Y / SCALE);

export const e7_mapped: [string, string][] = E7_WAYPOINTS.map(
  ([name, x, y]) => [
    `${Math.round((x - CROP_LEFT) / SCALE)},${Math.round(
      (y - CROP_TOP) / SCALE
    )}`,
    name,
  ]
);

export const img = new Image();
img.onload = () => {
  console.log("Image loaded");
};
img.src = imagepath;
