export interface ICachePort {
  /**
   * Retrieves a value from the cache.
   * @param key The cache key.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Sets a value in the cache with an optional TTL.
   * @param key The cache key.
   * @param value The value to store.
   * @param ttlSeconds Time to live in seconds.
   */
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache.
   * @param key The cache key.
   */
  del(key: string): Promise<void>;

  /**
   * Increments a key atomically.
   * @param key The cache key to increment.
   * @returns The new value.
   */
  incr(key: string): Promise<number>;
}
