/* Miscellaneous utilities */

/**
 * Determine if a given string is a valid URL as per RFC 3886.
 * 
 * Copied from https://stackoverflow.com/a/43467144
 * 
 * @param string String to test
 * @returns `true` if `string` is a valid URL
 */
export function isValidHttpUrl(string:string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
}
