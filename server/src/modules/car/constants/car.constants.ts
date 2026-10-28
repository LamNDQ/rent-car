export const SEASONS = {
  PEAK: {
    start: { month: 5, day: 1 }, // June 1st
    end: { month: 8, day: 15 }, // Sept 15th
  },
  MID: [
    {
      start: { month: 8, day: 15 }, // Sept 15th
      end: { month: 9, day: 31 }, // Oct 31st
    },
    {
      start: { month: 2, day: 1 }, // March 1st
      end: { month: 5, day: 1 }, // June 1st
    },
  ],
  OFF: [
    {
      start: { month: 10, day: 1 }, // Nov 1st
      end: { month: 1, day: 28 }, // March 1st (Feb 28/29) - simplifying to Mar 1
    },
  ],
};

export enum CarField {
  ID = '_id',
  BRAND = 'brand',
  CAR_MODEL = 'carModel',
  YEAR = 'year',
  COLOR = 'color',
  SEAT = 'seat',
  PEAK_PRICE = 'peakPrice',
  MID_RICE = 'midPrice',
  OFF_PRICE = 'offPrice',
  STOCK = 'stock',
  AVAILABLE_STOCK = 'availableStock',
  IS_AVAILABLE = 'isAvailable',
  IMG_URL = 'imgUrl',
}

export enum Season {
  PEAK = 'PEAK',
  MID = 'MID',
  OFF = 'OFF',
}
