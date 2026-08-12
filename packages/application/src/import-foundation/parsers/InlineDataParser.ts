import { CsvImportStreamParser } from './CsvImportStreamParser';
import { ParsedImportRow, ImportParseError } from '@manaratak/domain';

export class InlineDataParser {
  public static async parse(dataText: string): Promise<any[]> {
    const text = dataText.trim();
    let rawRows: any[] = [];

    if (text.startsWith('[') || text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        rawRows = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err: any) {
        throw new Error(`Invalid JSON format: ${err.message}`);
      }
    } else {
      // Use existing CsvImportStreamParser
      const parser = new CsvImportStreamParser();
      const encoder = new TextEncoder();
      const iterable = {
        [Symbol.asyncIterator]: async function* () {
          yield encoder.encode(text);
        }
      };

      for await (const result of parser.parse(iterable, { batchId: 'inline' })) {
        if (result instanceof ImportParseError) {
           throw new Error(`CSV Parse Error: ${result.message}`);
        }
        if (result instanceof ParsedImportRow) {
           // Emulate the old behavior that included _sourceRowNumber on the object
           rawRows.push({
             ...result.raw,
             _sourceRowNumber: result.sourceRowNumber - 1, // original had 1 for row 1 (excluding header)
           });
        }
      }
    }

    return rawRows;
  }
}
