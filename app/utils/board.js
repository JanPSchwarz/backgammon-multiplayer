const board = [
  [
    {
      fields: [12, 11, 10, 9, 8, 7],
      areaStyles: `grid h-full w-full grid-cols-6`,
      fieldStyles: `grid translate-x-[3%] translate-y-[-1%] grid-cols-1 place-content-start`,
      stoneStyles: ``,
    },
    {
      fields: [6, 5, 4, 3, 2, 1],
      areaStyles: `grid h-full w-full grid-cols-6`,
      fieldStyles: `grid translate-x-[2%] grid-cols-1 place-content-start`,
      stoneStyles: ``,
    },
  ],
  [
    {
      fields: [13, 14, 15, 16, 17, 18],
      areaStyles: `grid h-full w-[95%] grid-cols-6`,
      fieldStyles: `grid grid-cols-1 translate-x-[-12%] place-content-end`,
      stoneStyles: ``,
    },
    {
      fields: [19, 20, 21, 22, 23, 24],
      areaStyles: `grid h-full w-[93%] grid-cols-6`,
      fieldStyles: `grid grid-cols-1 translate-x-[-22%] place-content-end gap-[0.5%]`,
      stoneStyles: ``,
    },
  ],
];

export { board };
