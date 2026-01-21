import 'reflect-metadata';
import { GetMenuByRestaurantUseCase } from './GetMenuByRestaurant';
import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { ICachePort } from '@application/ports/ICachePort';
import { IEventBusPort } from '@application/ports/IEventBusPort';

// Mocks
const mockMenuRepo: jest.Mocked<IMenuRepository> = {
  findAllCategoriesWithItems: jest.fn(),
  findItemById: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCache: jest.Mocked<ICachePort> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
};

const mockEventBus: jest.Mocked<IEventBusPort> = {
  publish: jest.fn(),
  subscribe: jest.fn(),
};

describe('GetMenuByRestaurantUseCase', () => {
  let useCase: GetMenuByRestaurantUseCase;
  const restaurantId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    useCase = new GetMenuByRestaurantUseCase(mockMenuRepo, mockCache, mockEventBus);
    jest.clearAllMocks();
  });

  it('should return cached menu if available and publish MenuViewed event', async () => {
    // Arrange
    const cachedMenu = [{ id: 'cat1', name: 'Starters', items: [] }];
    mockCache.get.mockResolvedValue(cachedMenu);

    // Act
    const result = await useCase.execute(restaurantId);

    // Assert
    expect(result).toEqual(cachedMenu);
    expect(mockCache.get).toHaveBeenCalledWith(expect.stringContaining(restaurantId));
    expect(mockMenuRepo.findAllCategoriesWithItems).not.toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith('MenuViewed', {
      restaurantId,
      source: 'cache',
    });
  });

  it('should fetch from repository if cache miss, cache it, and publish event', async () => {
    // Arrange
    mockCache.get.mockResolvedValue(null);
    const dbMenu = [{ id: 'cat1', name: 'Starters', items: [] } as any];
    mockMenuRepo.findAllCategoriesWithItems.mockResolvedValue(dbMenu);

    // Act
    const result = await useCase.execute(restaurantId);

    // Assert
    expect(result).toEqual(dbMenu);
    expect(mockMenuRepo.findAllCategoriesWithItems).toHaveBeenCalledWith(restaurantId);
    expect(mockCache.set).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledWith('MenuViewed', { restaurantId, source: 'db' });
  });

  it('should return empty array if no menu found', async () => {
    // Arrange
    mockCache.get.mockResolvedValue(null);
    mockMenuRepo.findAllCategoriesWithItems.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(restaurantId);

    // Assert
    expect(result).toEqual([]);
    expect(mockEventBus.publish).toHaveBeenCalledWith('MenuViewed', { restaurantId, source: 'db' });
  });
});
