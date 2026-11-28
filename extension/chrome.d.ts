declare const chrome: {
  tabs: {
    query(query: { active: boolean; currentWindow: boolean }): Promise<Array<{ id?: number; url?: string }>>;
    create(options: { url: string }): Promise<unknown>;
  };
  scripting: {
    executeScript<T>(options: { target: { tabId: number }; func: () => T }): Promise<Array<{ result?: T }>>;
  };
  storage: { local: {
    get(key: string): Promise<Record<string, unknown>>;
    set(values: Record<string, unknown>): Promise<void>;
    remove(key: string): Promise<void>;
  } };
};
