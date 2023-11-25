import * as utc from 'dayjs/plugin/utc';
import * as dayjs from 'dayjs';
dayjs.extend(utc);

export function CurrentTime(): string {
  return dayjs().format();
}

export const Dayjs = dayjs;
