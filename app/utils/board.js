const board = [
  [
    {
      fields: [12, 11, 10, 9, 8, 7],
      areaStyles: `w-full`,
      fieldStyles: `translate-x-[3%] translate-y-[-1%] place-content-start`,
      stoneStyles: ``,
    },
    {
      fields: [6, 5, 4, 3, 2, 1],
      areaStyles: `w-full`,
      fieldStyles: `translate-x-[2%] place-content-start`,
      stoneStyles: ``,
    },
  ],
  [
    {
      fields: [13, 14, 15, 16, 17, 18],
      areaStyles: `w-[95%]`,
      fieldStyles: `translate-x-[-12%] place-content-end`,
      stoneStyles: `bottom-0`,
    },
    {
      fields: [19, 20, 21, 22, 23, 24],
      areaStyles: `w-[93%]`,
      fieldStyles: `translate-x-[-22%] place-content-end`,
      stoneStyles: `bottom-0`,
    },
  ],
];

export { board };
