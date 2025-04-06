const board = [
  [
    {
      fields: [12, 11, 10, 9, 8, 7],
      areaStyles: `w-full translate-x-[1%] translate-y-[-1%] `,
      fieldStyles: `place-content-start`,
      stoneStyles: ``,
    },
    {
      fields: [6, 5, 4, 3, 2, 1],
      areaStyles: `w-[99%] translate-x-[0%]`,
      fieldStyles: `place-content-start`,
      stoneStyles: ``,
    },
  ],
  [
    {
      fields: [13, 14, 15, 16, 17, 18],
      areaStyles: `w-[91%] translate-x-[-0.5%]`,
      fieldStyles: ` place-content-end`,
      stoneStyles: `bottom-0`,
    },
    {
      fields: [19, 20, 21, 22, 23, 24],
      areaStyles: `w-[90%] translate-x-[-2%]`,
      fieldStyles: ` place-content-end`,
      stoneStyles: `bottom-0 translate-x-[-5%]`,
    },
  ],
];

export { board };
