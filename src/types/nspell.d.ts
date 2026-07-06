declare module "nspell" {
  export interface Spellchecker {
    correct(word: string): boolean;
    suggest(word: string): string[];
    add(word: string): void;
    remove(word: string): void;
  }

  function nspell(aff: string, dic: string): Spellchecker;
  function nspell(dict: { aff: string; dic: string }): Spellchecker;
  function nspell(dictionaries: Array<{ aff: string; dic: string }>): Spellchecker;

  export default nspell;
}
