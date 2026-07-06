import { create } from "zustand";
import { devtools } from "zustand/middleware";
import nspell, { Spellchecker } from "nspell";
import { getSpellchecker, checkText, type MisspelledWord } from "@/lib/spellchecker";
import { useSettingsStore } from "@/features/setting/store/settings-store";

interface SpellcheckState {
  // State
  isEnabled: boolean;
  isLoading: boolean;
  language: string | null;
  ignoredWords: Set<string>;
  customWords: Set<string>;
  
  // Actions
  toggleEnabled: () => void;
  setLanguage: (lang: string) => Promise<void>;
  ignoreWord: (word: string) => void;
  addCustomWord: (word: string) => Promise<void>;
  checkText: (text: string) => MisspelledWord[];
  
  // Internal sync
  syncCustomWords: () => void;
}

export const useSpellcheckStore = create<SpellcheckState>()(
  devtools(
    (set, get) => {
      let activeSpellchecker: Spellchecker | null = null;

      return {
        isEnabled: false,
        isLoading: false,
        language: null,
        ignoredWords: new Set<string>(),
        customWords: new Set<string>(),

        toggleEnabled: () => {
          set((state) => ({ isEnabled: !state.isEnabled }));
        },

        setLanguage: async (lang) => {
          if (get().language === lang && activeSpellchecker) return;
          
          set({ isLoading: true, language: lang });
          try {
            const spellchecker = await getSpellchecker(lang);
            activeSpellchecker = spellchecker;
            
            // Sync custom words from settings store when loading language
            get().syncCustomWords();
          } catch (err) {
            console.error("Error initializing spellchecker in store:", err);
            activeSpellchecker = null;
          } finally {
            set({ isLoading: false });
          }
        },

        syncCustomWords: () => {
          const preferences = useSettingsStore.getState().preferences;
          const dictArray = preferences?.customDictionary || [];
          set({ customWords: new Set(dictArray.map((w: string) => w.toLowerCase())) });
        },

        ignoreWord: (word) => {
          const lower = word.toLowerCase();
          set((state) => {
            const newIgnored = new Set(state.ignoredWords);
            newIgnored.add(lower);
            return { ignoredWords: newIgnored };
          });
        },

        addCustomWord: async (word) => {
          const lower = word.toLowerCase();
          set((state) => {
            const newCustom = new Set(state.customWords);
            newCustom.add(lower);
            return { customWords: newCustom };
          });

          // Sync to DB settings preferences
          const settingsStore = useSettingsStore.getState();
          const currentDict = settingsStore.preferences?.customDictionary || [];
          if (!currentDict.includes(lower)) {
            const updatedDict = [...currentDict, lower];
            await settingsStore.updatePreference("customDictionary", updatedDict);
          }
        },

        checkText: (text) => {
          if (!get().isEnabled || !activeSpellchecker) return [];
          return checkText(text, activeSpellchecker, get().ignoredWords, get().customWords);
        },
      };
    },
    { name: "spellcheck-store" }
  )
);
