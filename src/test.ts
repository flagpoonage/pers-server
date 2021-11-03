import { v4 as uuid } from 'uuid';

export function makeUuid() {
  return uuid();
}

console.log(makeUuid());
