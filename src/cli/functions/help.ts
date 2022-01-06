import { Functions } from "."

export const help = (device) => {
  return (args) => console.log(`commands: ${Object.keys(Functions.all()).join(",")}`)
}