/**
 * A function that takes a string and returns a slugified lower case version of it.
 * @param string The string to slugify.
 * @returns The slugified string.
 */
export default function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
