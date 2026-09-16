export function getTotalPage(totalOfObjects: number, offset = 0): number {
  if (!offset) {
    return 0;
  }

  return totalOfObjects % offset === 0
    ? totalOfObjects / offset
    : Number.parseInt(`${totalOfObjects / offset}`, 10) + 1;
}

export default getTotalPage;
