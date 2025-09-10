import type { SayHelloProps } from "./types";

export function sayHello({ firstName, lastName, age }: SayHelloProps) {
  return `Hello ${firstName} ${lastName} ${age}`;
}
