import { Pipe, PipeTransform } from '@angular/core';
import { TERM_MARK } from '../data/analysis/analysis.models';

interface TextPart {
  text: string;
  code: boolean;
}

@Pipe({ name: 'codeParts' })
export class CodePartsPipe implements PipeTransform {
  transform(text: string): TextPart[] {
    // Marks come in pairs, so every odd part sits between two of them.
    return text.split(TERM_MARK).flatMap((part, at) => (part ? [{ text: part, code: at % 2 === 1 }] : []));
  }
}
