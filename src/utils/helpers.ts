import fs from "fs/promises";

/**
 * Reads and parses a JSON file asynchronously.
 *
 * This function reads the contents of a JSON file from the specified `filePath`
 * and attempts to parse it into a JavaScript object. If an error occurs (e.g., file not found,
 * invalid JSON format, or permission issues), it throws an exception.
 *
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<any>} A promise that resolves to the parsed JSON object
 */
export async function readJson(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    logAndRethrow(`Could not read JSON ${filePath}`, err);
  }
}

/**
 * Logs an error with context and rethrows it with additional information.
 *
 * @param {string} context - Description of where the error occurred.
 * @param {unknown} error - The original error to log and rethrow.
 * @throws {Error} A new error with context, wrapping the original error message.
 */
export function logAndRethrow(context: string, error: unknown): never {
  if (error instanceof Error) {
    console.warn(`${context}: ${error.message}`);
    throw new Error(`${context}: ${error.message}`);
  } else {
    console.warn(`${context}: Unknown error occurred`);
    throw new Error(`${context}: Unknown error occurred`);
  }
}

/**
 * Logs an error with context.
 *
 * @param {string} context - Description of where the error occurred.
 * @param {unknown} error - The original error to log.
 */
export function logOnly(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.warn(`${context}: ${error.message}`);
  } else {
    console.warn(`${context}: Unknown error occurred`);
  }
}
