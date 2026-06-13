import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { generateDemoTransactions, type Transaction } from "./demo-data";
import { analyze, type Analysis } from "./finance";

interface DataCtx {
  transactions: Transaction[];
  analysis: Analysis | null;
  hasData: boolean;
  loadDemo: () => void;
  addTransactions: (t: Transaction[]) => void;
  clear: () => void;
  achievements: string[];
  unlock: (id: string) => void;
}

const Ctx = createContext<DataCtx | null>(null);
const TXN_KEY = "rupeesense.transactions";
const ACH_KEY = "rupeesense.achievements";

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TXN_KEY);
      if (raw) setTransactions(JSON.parse(raw));
      const a = localStorage.getItem(ACH_KEY);
      if (a) setAchievements(JSON.parse(a));
    } catch {}
  }, []);

  const persist = useCallback((t: Transaction[]) => {
    setTransactions(t);
    localStorage.setItem(TXN_KEY, JSON.stringify(t));
  }, []);

  const loadDemo = useCallback(() => {
    const t = generateDemoTransactions(60);
    persist(t);
    unlockInternal("first-analysis");
  }, [persist]);

  const addTransactions = useCallback(
    (t: Transaction[]) => {
      persist([...t, ...transactions]);
      unlockInternal("first-analysis");
    },
    [persist, transactions],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const unlockInternal = useCallback((id: string) => {
    setAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(ACH_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const analysis = useMemo(() => (transactions.length ? analyze(transactions) : null), [transactions]);

  return (
    <Ctx.Provider
      value={{
        transactions,
        analysis,
        hasData: transactions.length > 0,
        loadDemo,
        addTransactions,
        clear,
        achievements,
        unlock: unlockInternal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be inside DataProvider");
  return v;
}
