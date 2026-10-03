// The `.svg: text` loader in angular.json hands every SVG import over as its markup.
declare module '*.svg' {
  const markup: string;
  export default markup;
}
